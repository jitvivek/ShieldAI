/**
 * ML Classifier Client — HTTP client for the Python ML sidecar service.
 * Implements connection pooling, timeouts, retries, and circuit breaker pattern.
 */

import http from 'http';

import { logger } from '../config/logger';
import { getEnv } from '../config/env';
import { ClassifyRequest, ClassifyResponse, MLClassifierResult } from '../types/detection';

// HTTP agent with keep-alive for connection pooling
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 20,
  maxFreeSockets: 5,
  timeout: 60_000,
});

// Circuit breaker state
let consecutiveFailures = 0;
let circuitOpenUntil = 0;
const CIRCUIT_FAILURE_THRESHOLD = 5;
const CIRCUIT_RESET_MS = 30_000;

/**
 * Check if the circuit breaker is open (ML service considered down).
 */
export function isCircuitOpen(): boolean {
  if (consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD) {
    if (Date.now() < circuitOpenUntil) {
      return true;
    }
    // Half-open: allow one request through
    return false;
  }
  return false;
}

/**
 * Record a successful call — reset the circuit breaker.
 */
function recordSuccess(): void {
  consecutiveFailures = 0;
}

/**
 * Record a failed call — increment failure counter, potentially open circuit.
 */
function recordFailure(): void {
  consecutiveFailures++;
  if (consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD) {
    circuitOpenUntil = Date.now() + CIRCUIT_RESET_MS;
    logger.warn(
      { consecutiveFailures, resetMs: CIRCUIT_RESET_MS },
      'ML service circuit breaker OPEN — falling back to rule-engine only',
    );
  }
}

/**
 * Make an HTTP request to the ML sidecar service with timeout and retry.
 */
async function mlRequest<T>(
  path: string,
  body: Record<string, unknown>,
  retries: number = 1,
): Promise<T> {
  const env = getEnv();
  const url = `${env.ML_SERVICE_URL}${path}`;
  const timeout = env.ML_SERVICE_TIMEOUT_MS;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`ML service returned ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as T;
      recordSuccess();
      return data;
    } catch (err) {
      if (attempt === retries) {
        recordFailure();
        throw err;
      }
      logger.warn(
        { attempt: attempt + 1, path, err: (err as Error).message },
        'ML service request failed, retrying',
      );
    }
  }

  // Should never reach here, but TypeScript requires it
  throw new Error('ML service request failed after all retries');
}

/**
 * Classify text as safe/suspicious/malicious using the ML model.
 */
export async function classify(
  text: string,
  normalizedText: string,
): Promise<MLClassifierResult | null> {
  if (isCircuitOpen()) {
    logger.debug('ML classifier circuit open — skipping');
    return null;
  }

  try {
    const start = performance.now();

    const request: ClassifyRequest = {
      text,
      normalized_text: normalizedText,
    };

    const response = await mlRequest<ClassifyResponse>('/classify', request as unknown as Record<string, unknown>);

    // Convert ML label to a 0-1 score
    let score: number;
    switch (response.label) {
      case 'malicious':
        score = response.probabilities.malicious;
        break;
      case 'suspicious':
        score = 0.3 + response.probabilities.suspicious * 0.4;
        break;
      case 'safe':
      default:
        score = response.probabilities.malicious * 0.3 + response.probabilities.suspicious * 0.2;
        break;
    }

    return {
      score: Math.min(1.0, score),
      label: response.label,
      confidence: response.confidence,
      processingTimeMs: Math.round(performance.now() - start),
    };
  } catch (err) {
    logger.warn({ err: (err as Error).message }, 'ML classifier call failed');
    return null;
  }
}

/**
 * Health check for the ML service.
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const env = getEnv();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${env.ML_SERVICE_URL}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timer);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get circuit breaker status for health endpoint reporting.
 */
export function getCircuitStatus(): { open: boolean; failures: number; resetsIn: number | null } {
  return {
    open: isCircuitOpen(),
    failures: consecutiveFailures,
    resetsIn: circuitOpenUntil > Date.now() ? circuitOpenUntil - Date.now() : null,
  };
}
