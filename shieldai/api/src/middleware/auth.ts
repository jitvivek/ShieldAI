import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

import { logger } from '../config/logger';
import { getRedis } from '../config/redis';
import { getEnv } from '../config/env';
import { hashApiKey, isValidKeyFormat } from '../utils/crypto';
import { AuthenticatedRequest } from '../types/common';

const prisma = new PrismaClient();

// Extend Express Request with auth info
declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedRequest;
    }
  }
}

/**
 * API key authentication middleware.
 * Extracts the key from the Authorization header, validates format,
 * hashes it, and looks up in DB (with Redis cache).
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing Authorization header. Use: Bearer sk-shield-<key>',
      },
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid Authorization header format. Use: Bearer sk-shield-<key>',
      },
    });
    return;
  }

  const apiKey = parts[1]!;

  if (!isValidKeyFormat(apiKey)) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid API key format',
      },
    });
    return;
  }

  const keyHash = hashApiKey(apiKey);

  try {
    // Check Redis cache first
    const redis = getRedis();
    const env = getEnv();
    const cacheKey = `auth:${keyHash}`;
    const cached = await redis.get(cacheKey);

    let authInfo: AuthenticatedRequest;

    if (cached) {
      authInfo = JSON.parse(cached) as AuthenticatedRequest;
    } else {
      // Look up in database
      const dbKey = await prisma.apiKey.findUnique({
        where: { keyHash },
        select: {
          id: true,
          customerId: true,
          tier: true,
          isActive: true,
        },
      });

      if (!dbKey) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid API key',
          },
        });
        return;
      }

      if (!dbKey.isActive) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'API key has been revoked',
          },
        });
        return;
      }

      authInfo = {
        apiKeyId: dbKey.id,
        customerId: dbKey.customerId,
        tier: dbKey.tier,
      };

      // Cache in Redis
      await redis.set(cacheKey, JSON.stringify(authInfo), 'EX', env.API_KEY_CACHE_TTL_SECONDS);
    }

    // Update last used timestamp (fire and forget — do not block request)
    prisma.apiKey
      .update({
        where: { keyHash },
        data: { lastUsedAt: new Date() },
      })
      .catch((err) => {
        logger.warn({ err }, 'Failed to update API key lastUsedAt');
      });

    req.auth = authInfo;
    next();
  } catch (err) {
    logger.error({ err }, 'Auth middleware error');
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication service error',
      },
    });
  }
}
