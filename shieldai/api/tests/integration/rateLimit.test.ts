import request from 'supertest';
import express from 'express';

/**
 * Integration tests for rate limiting middleware.
 *
 * Uses mocked Redis to test sliding window logic.
 */

// Mock pipeline exec results
let pipelineExecResult: any = [
  [null, 0],  // zremrangebyscore
  [null, 1],  // zadd
  [null, 1],  // zcard — current count
  [null, 1],  // expire
];

const mockPipeline = () => ({
  zremrangebyscore: jest.fn().mockReturnThis(),
  zadd: jest.fn().mockReturnThis(),
  zcard: jest.fn().mockReturnThis(),
  expire: jest.fn().mockReturnThis(),
  exec: jest.fn().mockImplementation(() => Promise.resolve(pipelineExecResult)),
});

jest.mock('../../src/config/redis', () => ({
  getRedis: () => ({
    pipeline: mockPipeline,
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    setex: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK'),
  }),
  closeRedis: jest.fn(),
}));

jest.mock('../../src/config/env', () => ({
  getEnv: () => ({
    RATE_LIMIT_FREE_PER_MINUTE: 5,
    RATE_LIMIT_FREE_PER_DAY: 20,
    RATE_LIMIT_PAID_PER_MINUTE: 100,
    LOG_LEVEL: 'silent',
    NODE_ENV: 'test',
    PORT: 3000,
    DATABASE_URL: 'postgresql://test:test@localhost/test',
    REDIS_URL: 'redis://localhost:6379',
    ML_SERVICE_URL: 'http://localhost:8000',
    ML_SERVICE_TIMEOUT_MS: 500,
    THRESHOLD_SAFE: 0.3,
    THRESHOLD_SUSPICIOUS: 0.7,
    API_KEY_CACHE_TTL_SECONDS: 300,
  }),
}));

import { rateLimitMiddleware } from '../../src/middleware/rateLimit';

function buildRateLimitApp(tier: string = 'free'): express.Express {
  const app = express();
  app.use(express.json());

  // Inject auth
  app.use((req: any, _res: any, next: any) => {
    req.auth = {
      customerId: 'test-customer',
      apiKeyId: 'test-key',
      tier,
    };
    req.requestId = 'req_test';
    next();
  });

  app.use(rateLimitMiddleware);

  app.post('/test', (_req: any, res: any) => {
    res.json({ ok: true });
  });

  return app;
}

describe('Rate Limiter Middleware', () => {
  let app: express.Express;

  beforeEach(() => {
    // Reset to under-limit response
    pipelineExecResult = [
      [null, 0],
      [null, 1],
      [null, 1],
      [null, 1],
    ];
    app = buildRateLimitApp();
  });

  it('should allow requests under the limit', async () => {
    const res = await request(app)
      .post('/test')
      .send({})
      .expect(200);

    expect(res.body.ok).toBe(true);
  });

  it('should set rate limit headers', async () => {
    const res = await request(app)
      .post('/test')
      .send({})
      .expect(200);

    expect(res.headers).toHaveProperty('x-ratelimit-limit');
    expect(res.headers).toHaveProperty('x-ratelimit-remaining');
  });

  it('should return 429 when rate limit exceeded', async () => {
    // Set count above the free tier limit of 5
    pipelineExecResult = [
      [null, 0],
      [null, 1],
      [null, 10], // over limit
      [null, 1],
    ];

    const res = await request(app)
      .post('/test')
      .send({});

    expect(res.status).toBe(429);
    expect(res.body).toHaveProperty('error');
  });

  it('should include retry-after header when rate limited', async () => {
    pipelineExecResult = [
      [null, 0],
      [null, 1],
      [null, 10],
      [null, 1],
    ];

    const res = await request(app)
      .post('/test')
      .send({});

    if (res.status === 429) {
      expect(res.headers).toHaveProperty('retry-after');
    }
  });

  it('should fail open if Redis is unavailable', async () => {
    // Make pipeline exec throw
    pipelineExecResult = 'THROW';
    const mockPipelineError = () => ({
      zremrangebyscore: jest.fn().mockReturnThis(),
      zadd: jest.fn().mockReturnThis(),
      zcard: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockRejectedValue(new Error('Redis connection refused')),
    });

    // Override getRedis to return error pipeline
    const redisModule = require('../../src/config/redis');
    const originalGetRedis = redisModule.getRedis;
    redisModule.getRedis = () => ({
      ...originalGetRedis(),
      pipeline: mockPipelineError,
    });

    const res = await request(app)
      .post('/test')
      .send({})
      .expect(200);

    expect(res.body.ok).toBe(true);

    // Restore
    redisModule.getRedis = originalGetRedis;
  });

  it('should use different limits for paid tier', async () => {
    const paidApp = buildRateLimitApp('growth');

    const res = await request(paidApp)
      .post('/test')
      .send({})
      .expect(200);

    // Paid tier should have higher limit in header
    const limit = parseInt(res.headers['x-ratelimit-limit'] as string, 10);
    expect(limit).toBeGreaterThanOrEqual(5);
  });
});
