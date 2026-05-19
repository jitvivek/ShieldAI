/**
 * POST /v1/detect — Main detection endpoint.
 * Accepts user input and runs it through the full detection pipeline.
 *
 * @swagger
 * /v1/detect:
 *   post:
 *     summary: Detect prompt injection
 *     description: Analyze text for prompt injection attacks
 *     tags: [Detection]
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
 *                 description: Text to analyze
 *               config:
 *                 type: object
 *                 properties:
 *                   threshold:
 *                     type: number
 *                   categories:
 *                     type: string
 *                   include_breakdown:
 *                     type: boolean
 *                   language_hint:
 *                     type: string
 *     responses:
 *       200:
 *         description: Detection result
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication error
 *       429:
 *         description: Rate limit exceeded
 */

import { Router, Request, Response } from 'express';

import { detectRequestSchema } from '../../utils/validators';
import { runPipeline } from '../../services/detectionPipeline';
import { DetectResponse } from '../../types/detection';

const router = Router();

router.post('/', async (req: Request, res: Response, next): Promise<void> => {
  try {
    // Validate request body
    const parsed = detectRequestSchema.parse(req.body);

    const requestId = req.requestId ?? 'unknown';
    const auth = req.auth!;

    // Run detection pipeline
    const result = await runPipeline(
      parsed.input,
      requestId,
      auth.apiKeyId,
      auth.customerId,
      parsed.config,
    );

    // Build response
    const response: DetectResponse = {
      request_id: result.requestId,
      verdict: result.verdict,
      risk_score: result.riskScore,
      category: result.category,
      subcategory: result.subcategory,
      explanation: result.explanation,
      degraded: result.degraded,
      latency_ms: result.latencyMs,
    };

    // Only include breakdown if requested (default: true)
    if (parsed.config?.include_breakdown !== false) {
      response.breakdown = result.breakdown;
      response.preprocessing = result.preprocessing;
      response.pii = result.pii;
      response.language = result.language;
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
