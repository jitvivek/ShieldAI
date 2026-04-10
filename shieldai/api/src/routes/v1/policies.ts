/**
 * Phase 2 — CRUD for customer policies
 * POST /v1/policies — Create policy
 * GET /v1/policies — List policies
 * GET /v1/policies/:name — Get policy
 * PUT /v1/policies/:name — Update policy
 * DELETE /v1/policies/:name — Deactivate policy
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

import { parsePolicy } from '../../services/policyEngine';
import { getRedis } from '../../config/redis';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /v1/policies:
 *   post:
 *     summary: Create a new policy
 *     tags: [Policies]
 *     security:
 *       - BearerAuth: []
 */

const createPolicySchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/i, 'Name must be alphanumeric with hyphens/underscores'),
  yaml_content: z.string().min(10).max(50000),
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = createPolicySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: { code: 'INVALID_REQUEST', message: 'Invalid policy', details: parsed.error.flatten().fieldErrors },
    });
    return;
  }

  const auth = req.auth!;

  // Validate YAML content
  try {
    parsePolicy(parsed.data.yaml_content);
  } catch (err) {
    res.status(400).json({
      error: { code: 'INVALID_POLICY_YAML', message: (err as Error).message },
    });
    return;
  }

  // Check if policy with same name exists
  const existing = await prisma.policy.findFirst({
    where: { customerId: auth.customerId, name: parsed.data.name, isActive: true },
    orderBy: { version: 'desc' },
  });

  const version = existing ? existing.version + 1 : 1;

  const policy = await prisma.policy.create({
    data: {
      customerId: auth.customerId,
      name: parsed.data.name,
      yamlContent: parsed.data.yaml_content,
      version,
    },
  });

  // Invalidate cache
  const redis = getRedis();
  await redis.del(`policy:${auth.customerId}:${parsed.data.name}`);

  res.status(201).json({
    id: policy.id,
    name: policy.name,
    version: policy.version,
    is_active: policy.isActive,
    created_at: policy.createdAt.toISOString(),
  });
});

/**
 * GET /v1/policies — List all policies for the customer
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const auth = req.auth!;

  const policies = await prisma.policy.findMany({
    where: { customerId: auth.customerId, isActive: true },
    orderBy: { createdAt: 'desc' },
    distinct: ['name'],
    select: {
      id: true,
      name: true,
      version: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({
    data: policies.map((p) => ({
      id: p.id,
      name: p.name,
      version: p.version,
      is_active: p.isActive,
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    })),
    total: policies.length,
  });
});

/**
 * GET /v1/policies/:name — Get policy by name
 */
router.get('/:name', async (req: Request, res: Response): Promise<void> => {
  const auth = req.auth!;

  const policy = await prisma.policy.findFirst({
    where: { customerId: auth.customerId, name: req.params['name'], isActive: true },
    orderBy: { version: 'desc' },
  });

  if (!policy) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Policy not found' } });
    return;
  }

  res.json({
    id: policy.id,
    name: policy.name,
    yaml_content: policy.yamlContent,
    version: policy.version,
    is_active: policy.isActive,
    created_at: policy.createdAt.toISOString(),
    updated_at: policy.updatedAt.toISOString(),
  });
});

/**
 * PUT /v1/policies/:name — Update policy (creates new version)
 */
router.put('/:name', async (req: Request, res: Response): Promise<void> => {
  const auth = req.auth!;
  const updateSchema = z.object({ yaml_content: z.string().min(10).max(50000) });
  const parsed = updateSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: { code: 'INVALID_REQUEST', message: 'Invalid update', details: parsed.error.flatten().fieldErrors },
    });
    return;
  }

  try {
    parsePolicy(parsed.data.yaml_content);
  } catch (err) {
    res.status(400).json({
      error: { code: 'INVALID_POLICY_YAML', message: (err as Error).message },
    });
    return;
  }

  const existing = await prisma.policy.findFirst({
    where: { customerId: auth.customerId, name: req.params['name'], isActive: true },
    orderBy: { version: 'desc' },
  });

  if (!existing) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Policy not found' } });
    return;
  }

  const policy = await prisma.policy.create({
    data: {
      customerId: auth.customerId,
      name: existing.name,
      yamlContent: parsed.data.yaml_content,
      version: existing.version + 1,
    },
  });

  // Invalidate cache
  const redis = getRedis();
  await redis.del(`policy:${auth.customerId}:${existing.name}`);

  res.json({
    id: policy.id,
    name: policy.name,
    version: policy.version,
    is_active: policy.isActive,
    created_at: policy.createdAt.toISOString(),
  });
});

/**
 * DELETE /v1/policies/:name — Deactivate policy
 */
router.delete('/:name', async (req: Request, res: Response): Promise<void> => {
  const auth = req.auth!;

  const result = await prisma.policy.updateMany({
    where: { customerId: auth.customerId, name: req.params['name'], isActive: true },
    data: { isActive: false },
  });

  if (result.count === 0) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Policy not found' } });
    return;
  }

  const redis = getRedis();
  await redis.del(`policy:${auth.customerId}:${req.params['name']}`);

  res.json({ message: 'Policy deactivated', versions_affected: result.count });
});

export default router;
