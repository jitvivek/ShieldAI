import Redis from 'ioredis';

import { getEnv } from './env';
import { logger } from './logger';

let redisClient: Redis | null = null;

/**
 * Get or create the singleton Redis client.
 * Configured with reconnect strategy and error logging.
 */
export function getRedis(): Redis {
  if (redisClient) return redisClient;

  const env = getEnv();

  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
    lazyConnect: false,
    enableReadyCheck: true,
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected');
  });

  redisClient.on('error', (err) => {
    logger.error({ err }, 'Redis connection error');
  });

  redisClient.on('close', () => {
    logger.warn('Redis connection closed');
  });

  return redisClient;
}

/**
 * Gracefully close the Redis connection.
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
