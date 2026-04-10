import { Request, Response, NextFunction } from 'express';

import { getRedis } from '../config/redis';
import { getEnv } from '../config/env';
import { logger } from '../config/logger';

/**
 * Redis-based sliding window rate limiter.
 * Uses a sorted set per API key to implement sliding window counting.
 * Free tier: 100 req/min, 1000 req/day. Paid tier: 1000 req/min, unlimited daily.
 */
export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.auth) {
    next();
    return;
  }

  const env = getEnv();
  const redis = getRedis();
  const tier = req.auth.tier;
  const keyId = req.auth.apiKeyId;
  const now = Date.now();

  const isPaid = tier !== 'free';

  const perMinuteLimit = isPaid ? env.RATE_LIMIT_PAID_PER_MINUTE : env.RATE_LIMIT_FREE_PER_MINUTE;
  const perDayLimit = isPaid ? Infinity : env.RATE_LIMIT_FREE_PER_DAY;

  try {
    // Sliding window for per-minute limit
    const minuteKey = `rl:min:${keyId}`;
    const minuteWindowStart = now - 60_000;

    // Use pipeline for atomic operations
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(minuteKey, 0, minuteWindowStart);
    pipeline.zadd(minuteKey, now, `${now}:${Math.random()}`);
    pipeline.zcard(minuteKey);
    pipeline.expire(minuteKey, 70); // Slightly longer than 1 minute for cleanup

    const minuteResults = await pipeline.exec();
    const minuteCount = (minuteResults?.[2]?.[1] as number) ?? 0;

    // Set rate limit headers
    const remaining = Math.max(0, perMinuteLimit - minuteCount);
    const resetTime = Math.ceil((minuteWindowStart + 60_000) / 1000);

    res.setHeader('X-RateLimit-Limit', perMinuteLimit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);

    if (minuteCount > perMinuteLimit) {
      const retryAfter = Math.ceil((minuteWindowStart + 60_000 - now) / 1000);
      res.setHeader('Retry-After', Math.max(1, retryAfter));

      logger.warn(
        { keyId, minuteCount, perMinuteLimit },
        'Rate limit exceeded (per-minute)',
      );

      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit of ${perMinuteLimit} requests per minute exceeded`,
          retry_after: Math.max(1, retryAfter),
        },
      });
      return;
    }

    // Check daily limit for free tier
    if (!isPaid) {
      const dayKey = `rl:day:${keyId}`;
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      const dayStartMs = dayStart.getTime();

      const dayPipeline = redis.pipeline();
      dayPipeline.zremrangebyscore(dayKey, 0, dayStartMs);
      dayPipeline.zadd(dayKey, now, `${now}:${Math.random()}`);
      dayPipeline.zcard(dayKey);
      dayPipeline.expire(dayKey, 86_500); // Slightly longer than 24 hours

      const dayResults = await dayPipeline.exec();
      const dayCount = (dayResults?.[2]?.[1] as number) ?? 0;

      if (dayCount > perDayLimit) {
        const nextDay = new Date(dayStart);
        nextDay.setDate(nextDay.getDate() + 1);
        const retryAfter = Math.ceil((nextDay.getTime() - now) / 1000);
        res.setHeader('Retry-After', retryAfter);

        logger.warn({ keyId, dayCount, perDayLimit }, 'Rate limit exceeded (per-day)');

        res.status(429).json({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Daily rate limit of ${perDayLimit} requests exceeded`,
            retry_after: retryAfter,
          },
        });
        return;
      }
    }

    next();
  } catch (err) {
    // If Redis is down, allow the request through (fail open for availability)
    logger.error({ err }, 'Rate limiter Redis error — failing open');
    next();
  }
}
