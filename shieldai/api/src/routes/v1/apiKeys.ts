/**
 * API Key management endpoints.
 *
 * @swagger
 * /v1/api-keys:
 *   get:
 *     summary: List API keys
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *   post:
 *     summary: Create a new API key
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { generateApiKey, hashApiKey, getKeyPrefix } from '../../utils/crypto';
import { createApiKeySchema } from '../../utils/validators';
import { getRedis } from '../../config/redis';
import { ApiKeyInfo, CreateApiKeyResponse } from '../../types/common';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /v1/api-keys — List all API keys for the authenticated customer.
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const auth = req.auth!;

  const keys = await prisma.apiKey.findMany({
    where: { customerId: auth.customerId },
    select: {
      id: true,
      keyPrefix: true,
      name: true,
      tier: true,
      isActive: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const response: ApiKeyInfo[] = keys.map((k) => ({
    id: k.id,
    keyPrefix: k.keyPrefix,
    name: k.name,
    tier: k.tier,
    isActive: k.isActive,
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  }));

  res.json({ data: response });
});

/**
 * POST /v1/api-keys — Create a new API key.
 * The full key is returned ONCE in the response and never shown again.
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = createApiKeySchema.parse(req.body);

  // Find or create customer
  let customer = await prisma.customer.findUnique({
    where: { email: parsed.customer_email },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        email: parsed.customer_email,
        name: parsed.customer_name ?? parsed.customer_email,
        company: parsed.company,
        tier: parsed.tier,
      },
    });
  }

  // Generate new API key
  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = getKeyPrefix(rawKey);

  const apiKey = await prisma.apiKey.create({
    data: {
      keyHash,
      keyPrefix,
      name: parsed.name,
      tier: parsed.tier,
      customerId: customer.id,
    },
  });

  const response: CreateApiKeyResponse = {
    key: rawKey,
    id: apiKey.id,
    keyPrefix,
    name: apiKey.name,
    tier: apiKey.tier,
  };

  res.status(201).json(response);
});

/**
 * DELETE /v1/api-keys/:id — Revoke an API key.
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const auth = req.auth!;
  const keyId = req.params['id'];

  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, customerId: auth.customerId },
  });

  if (!key) {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'API key not found' },
    });
    return;
  }

  // Revoke the key
  await prisma.apiKey.update({
    where: { id: keyId },
    data: { isActive: false },
  });

  // Invalidate Redis cache
  try {
    const redis = getRedis();
    await redis.del(`auth:${key.keyHash}`);
  } catch {
    // Redis error is not critical for revocation
  }

  res.json({ message: 'API key revoked' });
});

export default router;
