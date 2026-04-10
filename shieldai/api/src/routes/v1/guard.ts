/**
 * Phase 2 — POST /v1/guard route
 * Unified guardrail endpoint: input detection + output scanning + policy evaluation.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';

import { logger } from '../../config/logger';
import { runGuardPipeline } from '../../services/guardPipeline';

const router = Router();

/**
 * @swagger
 * /v1/guard:
 *   post:
 *     summary: Unified guardrail — scan input and/or output
 *     tags: [Guard]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [input]
 *             properties:
 *               input:
 *                 type: string
 *                 maxLength: 10000
 *               output:
 *                 type: string
 *                 maxLength: 50000
 *               policy:
 *                 type: string
 *               system_prompt:
 *                 type: string
 *               canary_tokens:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Guard result
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */

const guardRequestSchema = z.object({
  input: z.string().min(1).max(10000),
  output: z.string().max(50000).optional(),
  llm_provider: z.enum(['openai', 'anthropic', 'azure', 'custom']).optional(),
  llm_config: z
    .object({
      model: z.string(),
      api_key: z.string(),
      base_url: z.string().url().optional(),
    })
    .optional(),
  policy: z.string().optional(),
  system_prompt: z.string().max(10000).optional(),
  canary_tokens: z.array(z.string()).max(20).optional(),
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = guardRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Invalid guard request',
        details: parsed.error.flatten().fieldErrors,
      },
    });
    return;
  }

  const auth = req.auth!;

  const result = await runGuardPipeline(
    parsed.data,
    req.requestId!,
    auth.apiKeyId,
    auth.customerId,
  );

  res.json(result);
});

export default router;
