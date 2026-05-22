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
import { getBuilderParameters, buildPolicy, getIndustryPreset, PolicyBuildRequest } from '../../services/policyBuilder';
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

// ─── Policy Builder Endpoints (MUST be before /:name) ─────────────────────────

/**
 * GET /v1/policies/builder/parameters — Get available parameters for policy builder
 */
router.get('/builder/parameters', (_req: Request, res: Response): void => {
  const params = getBuilderParameters();
  res.json(params);
});

/**
 * GET /v1/policies/builder/presets/:industry — Get industry preset
 */
router.get('/builder/presets/:industry', (req: Request, res: Response): void => {
  const industry = req.params['industry'] ?? 'general';
  const preset = getIndustryPreset(industry);
  res.json(preset);
});

/**
 * POST /v1/policies/builder/generate — Generate YAML from parameters
 */
const buildPolicySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  industry: z.string().max(50).optional(),
  rules: z.array(z.object({
    detector: z.string(),
    action: z.enum(['block', 'flag', 'redact', 'truncate']),
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    threshold: z.number().min(0).max(1).optional(),
    patterns: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    max_tokens: z.number().int().min(100).max(100000).optional(),
    custom_patterns: z.array(z.string().max(200)).max(50).optional(),
  })).min(1).max(20),
});

router.post('/builder/generate', (req: Request, res: Response): void => {
  const parsed = buildPolicySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: { code: 'INVALID_REQUEST', message: 'Invalid build parameters', details: parsed.error.flatten().fieldErrors },
    });
    return;
  }

  try {
    const result = buildPolicy(parsed.data as PolicyBuildRequest);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      error: { code: 'BUILD_FAILED', message: (err as Error).message },
    });
  }
});

/**
 * POST /v1/policies/builder/create — Generate + save policy in one step
 */
router.post('/builder/create', async (req: Request, res: Response): Promise<void> => {
  const parsed = buildPolicySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: { code: 'INVALID_REQUEST', message: 'Invalid build parameters', details: parsed.error.flatten().fieldErrors },
    });
    return;
  }

  const auth = req.auth!;

  let result;
  try {
    result = buildPolicy(parsed.data as PolicyBuildRequest);
  } catch (err) {
    res.status(400).json({
      error: { code: 'BUILD_FAILED', message: (err as Error).message },
    });
    return;
  }

  // Validate the generated YAML
  try {
    parsePolicy(result.yaml_content);
  } catch (err) {
    res.status(400).json({
      error: { code: 'INVALID_GENERATED_POLICY', message: (err as Error).message },
    });
    return;
  }

  const policyName = parsed.data.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  // Check existing
  const existing = await prisma.policy.findFirst({
    where: { customerId: auth.customerId, name: policyName, isActive: true },
    orderBy: { version: 'desc' },
  });

  const version = existing ? existing.version + 1 : 1;

  const policy = await prisma.policy.create({
    data: {
      customerId: auth.customerId,
      name: policyName,
      yamlContent: result.yaml_content,
      version,
    },
  });

  // Invalidate cache
  const redis = getRedis();
  await redis.del(`policy:${auth.customerId}:${policyName}`);

  res.status(201).json({
    id: policy.id,
    name: policy.name,
    version: policy.version,
    is_active: policy.isActive,
    yaml_content: result.yaml_content,
    validation: result.validation,
    created_at: policy.createdAt.toISOString(),
  });
});

// ─── Standard CRUD (/:name comes AFTER /builder/*) ────────────────────────────

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
