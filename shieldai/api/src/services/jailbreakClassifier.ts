/**
 * Phase 2 — Jailbreak Classifier Client
 * HTTP client to ML sidecar POST /classify-jailbreak endpoint.
 * Enhanced 5-class jailbreak detection beyond Phase 1's injection detector.
 */

import { logger } from '../config/logger';
import { getEnv } from '../config/env';
import { JailbreakClassifyResult, JailbreakLabel } from '../types/guard';
import { isCircuitOpen } from './mlClassifier';

/**
 * Classify input for jailbreak attempts via the ML sidecar.
 * Returns null if ML service is unavailable (graceful degradation).
 */
export async function classifyJailbreak(
  text: string,
  normalizedText?: string,
): Promise<JailbreakClassifyResult | null> {
  if (isCircuitOpen()) {
    logger.debug('ML circuit open — skipping jailbreak classification');
    return null;
  }

  const env = getEnv();
  const url = `${env.ML_SERVICE_URL}/classify-jailbreak`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), env.ML_SERVICE_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        normalized_text: normalizedText ?? text,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`Jailbreak classifier returned ${response.status}`);
    }

    const data = (await response.json()) as {
      label: string;
      confidence: number;
      probabilities: Record<string, number>;
      inference_time_ms: number;
    };

    return {
      label: data.label as JailbreakLabel,
      confidence: data.confidence,
      probabilities: data.probabilities as Record<JailbreakLabel, number>,
      inferenceTimeMs: data.inference_time_ms,
    };
  } catch (err) {
    logger.warn({ err: (err as Error).message }, 'Jailbreak classification failed');
    return null;
  }
}
