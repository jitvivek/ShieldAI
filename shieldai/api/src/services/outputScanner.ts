/**
 * Phase 2 — Output Scanner Service
 * Scans LLM outputs for policy violations, PII leakage, system prompt leakage,
 * and canary token detection.
 */

import { logger } from '../config/logger';
import {
  OutputScanResult,
  PolicyViolation,
  PiiMatch,
  PolicyConfig,
  PolicyResult,
} from '../types/guard';
import { detectPii, redactPii } from './piiDetector';
import { detectPromptLeak } from './promptShield';
import { evaluatePolicies } from './policyEngine';

/**
 * Scan LLM output for policy violations.
 */
export async function scanOutput(
  output: string,
  options: {
    policy?: PolicyConfig;
    systemPrompt?: string;
    canaryTokens?: string[];
  } = {},
): Promise<OutputScanResult> {
  const start = performance.now();

  if (!output || output.length === 0) {
    return {
      verdict: 'pass',
      policyViolations: [],
      piiDetected: [],
      promptLeakScore: 0,
      canaryDetected: false,
      processingTimeMs: 0,
    };
  }

  // Cap output length to prevent DoS
  const truncatedOutput = output.length > 50000 ? output.slice(0, 50000) : output;

  // Run detections in parallel where possible
  const [piiMatches, promptShieldResult, canaryDetected] = await Promise.all([
    // PII detection (sync but wrapped)
    Promise.resolve(detectPii(truncatedOutput)),

    // Prompt leak detection (async — may call ML sidecar)
    options.systemPrompt
      ? detectPromptLeak(truncatedOutput, options.systemPrompt)
      : Promise.resolve({ leakDetected: false, leakScore: 0, method: null, detail: '' }),

    // Canary token detection (sync)
    Promise.resolve(detectCanaryTokens(truncatedOutput, options.canaryTokens ?? [])),
  ]);

  // Evaluate policy rules
  let policyResults: PolicyResult[] = [];
  if (options.policy) {
    policyResults = evaluatePolicies(truncatedOutput, options.policy, {
      promptLeakScore: promptShieldResult.leakScore,
      piiMatches,
    });
  }

  // Convert policy failures to violations
  const policyViolations: PolicyViolation[] = policyResults
    .filter((r) => !r.passed)
    .map((r) => ({
      policyName: r.policyName,
      action: r.action,
      severity: r.severity,
      detector: r.policyName,
      detail: r.detail ?? 'Policy violated',
    }));

  // Determine verdict
  const verdict = determineOutputVerdict(policyViolations, piiMatches, promptShieldResult.leakDetected, canaryDetected);

  // Produce cleaned output if redaction needed
  let cleanedOutput: string | undefined;
  const needsRedaction = policyViolations.some((v) => v.action === 'redact') || piiMatches.length > 0;
  if (needsRedaction && verdict !== 'block') {
    cleanedOutput = redactPii(truncatedOutput, piiMatches);
    // Apply truncation if policy says so
    const truncateRule = policyViolations.find((v) => v.action === 'truncate');
    if (truncateRule) {
      const maxChars = 2000 * 4; // ~2000 tokens
      if (cleanedOutput.length > maxChars) {
        cleanedOutput = cleanedOutput.slice(0, maxChars) + '... [TRUNCATED]';
      }
    }
  }

  const processingTimeMs = Math.round((performance.now() - start) * 100) / 100;

  logger.debug(
    {
      piiCount: piiMatches.length,
      promptLeakScore: promptShieldResult.leakScore,
      canaryDetected,
      policyViolationCount: policyViolations.length,
      verdict,
      processingTimeMs,
    },
    'Output scan complete',
  );

  return {
    verdict,
    policyViolations,
    piiDetected: piiMatches,
    promptLeakScore: promptShieldResult.leakScore,
    canaryDetected,
    cleanedOutput,
    processingTimeMs,
  };
}

/**
 * Determine output verdict based on all signals.
 */
function determineOutputVerdict(
  violations: PolicyViolation[],
  piiMatches: PiiMatch[],
  promptLeakDetected: boolean,
  canaryDetected: boolean,
): 'pass' | 'flag' | 'block' {
  // Block conditions
  if (canaryDetected) return 'block';
  if (promptLeakDetected) return 'block';
  if (violations.some((v) => v.action === 'block')) return 'block';
  if (violations.some((v) => v.severity === 'critical')) return 'block';

  // Flag conditions
  if (piiMatches.length > 0) return 'flag';
  if (violations.some((v) => v.action === 'flag')) return 'flag';
  if (violations.some((v) => v.severity === 'high')) return 'flag';

  return 'pass';
}

/**
 * Check if any canary tokens appear in the output.
 */
function detectCanaryTokens(output: string, canaryTokens: string[]): boolean {
  if (canaryTokens.length === 0) return false;
  const lowerOutput = output.toLowerCase();
  return canaryTokens.some((token) => lowerOutput.includes(token.toLowerCase()));
}
