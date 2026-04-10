/**
 * Phase 2 — POST /v1/scan/output route
 * Standalone output scanning endpoint.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';

import { logger } from '../../config/logger';
import { scanOutput } from '../../services/outputScanner';
import { parsePolicy, loadPolicy } from '../../services/policyEngine';

const router = Router();

/**
 * @swagger
 * /v1/scan/output:
 *   post:
 *     summary: Scan LLM output for policy violations, PII, and prompt leakage
 *     tags: [Output Scanner]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [output]
 *             properties:
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
 *         description: Output scan result
 */

const scanOutputSchema = z.object({
  output: z.string().min(1).max(50000),
  policy: z.string().optional(),
  system_prompt: z.string().max(10000).optional(),
  canary_tokens: z.array(z.string()).max(20).optional(),
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = scanOutputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Invalid scan output request',
        details: parsed.error.flatten().fieldErrors,
      },
    });
    return;
  }

  const auth = req.auth!;
  const { output, policy: policyNameOrYaml, system_prompt, canary_tokens } = parsed.data;

  // Load or parse policy
  let policyConfig = undefined;
  if (policyNameOrYaml) {
    try {
      if (policyNameOrYaml.includes(':') && policyNameOrYaml.includes('\n')) {
        policyConfig = parsePolicy(policyNameOrYaml);
      } else {
        policyConfig = (await loadPolicy(auth.customerId, policyNameOrYaml)) ?? undefined;
      }
    } catch (err) {
      res.status(400).json({
        error: {
          code: 'INVALID_POLICY',
          message: `Failed to parse policy: ${(err as Error).message}`,
        },
      });
      return;
    }
  }

  const result = await scanOutput(output, {
    policy: policyConfig,
    systemPrompt: system_prompt,
    canaryTokens: canary_tokens,
  });

  res.json({
    request_id: req.requestId,
    ...result,
  });
});

export default router;
