/**
 * GET /v1/health — Health check endpoint (no auth required).
 *
 * @swagger
 * /v1/health:
 *   get:
 *     summary: Health check
 *     description: Check service health and dependency status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { getRedis } from '../../config/redis';
import { healthCheck as mlHealthCheck, getCircuitStatus } from '../../services/mlClassifier';
import { getRuleCount } from '../../services/ruleEngine';
import { getEmbeddingCount } from '../../services/semanticSimilarity';
import { HealthResponse } from '../../types/common';

const router = Router();
const prisma = new PrismaClient();
const startTime = Date.now();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';
  let redisStatus: 'connected' | 'disconnected' = 'disconnected';
  let mlStatus: 'connected' | 'disconnected' = 'disconnected';

  // Check PostgreSQL
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  // Check Redis
  try {
    const redis = getRedis();
    await redis.ping();
    redisStatus = 'connected';
  } catch {
    redisStatus = 'disconnected';
  }

  // Check ML service
  try {
    const mlUp = await mlHealthCheck();
    mlStatus = mlUp ? 'connected' : 'disconnected';
  } catch {
    mlStatus = 'disconnected';
  }

  const allHealthy = dbStatus === 'connected' && redisStatus === 'connected';
  const status = allHealthy
    ? mlStatus === 'connected'
      ? 'healthy'
      : 'degraded'
    : 'unhealthy';

  const circuitStatus = getCircuitStatus();

  const response: HealthResponse & Record<string, unknown> = {
    status,
    version: '1.0.0',
    uptime: Math.round((Date.now() - startTime) / 1000),
    services: {
      database: dbStatus,
      redis: redisStatus,
      ml_service: mlStatus,
    },
    rules_loaded: getRuleCount(),
    embeddings_loaded: getEmbeddingCount(),
    ml_circuit_breaker: circuitStatus,
  };

  res.status(status === 'unhealthy' ? 503 : 200).json(response);
});

export default router;
