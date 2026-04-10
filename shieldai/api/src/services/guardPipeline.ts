/**
 * Phase 2 — Guard Pipeline Service
 * Unified endpoint orchestrator that wraps input detection (Phase 1) + output scanning (Phase 2).
 * POST /v1/guard — the full bidirectional guardrail.
 */

import { PrismaClient } from '@prisma/client';

import { logger } from '../config/logger';
import {
  GuardRequest,
  GuardResponse,
  InputVerdictResult,
  OutputScanResult,
  PolicyResult,
  PolicyConfig,
} from '../types/guard';
import { sha256 } from '../utils/crypto';

import { runPipeline } from './detectionPipeline';
import { classifyJailbreak } from './jailbreakClassifier';
import { scanOutput } from './outputScanner';
import { parsePolicy, loadPolicy } from './policyEngine';

const prisma = new PrismaClient();

/**
 * Run the full guard pipeline: input check → (optional) output scan → policy evaluation.
 */
export async function runGuardPipeline(
  request: GuardRequest,
  requestId: string,
  apiKeyId: string,
  customerId: string,
): Promise<GuardResponse> {
  const pipelineStart = performance.now();

  // Step 1: Run Phase 1 input detection pipeline
  const inputResult = await runPipeline(
    request.input,
    requestId,
    apiKeyId,
    customerId,
  );

  // Step 2: Run jailbreak classifier in parallel (non-blocking)
  let jailbreakResult: Awaited<ReturnType<typeof classifyJailbreak>> = null;
  try {
    jailbreakResult = await classifyJailbreak(request.input);
  } catch (err) {
    logger.warn({ requestId, err: (err as Error).message }, 'Jailbreak classifier failed');
  }

  // Build input verdict
  const inputVerdict: InputVerdictResult = {
    verdict: inputResult.verdict,
    risk_score: inputResult.riskScore,
    category: inputResult.category,
    explanation: inputResult.explanation,
    jailbreak_score: jailbreakResult?.confidence,
    jailbreak_label: jailbreakResult?.label,
  };

  // Step 3: Load policy if specified
  let policyConfig: PolicyConfig | null = null;
  if (request.policy) {
    try {
      // Try parsing as inline YAML first
      if (request.policy.includes(':') && request.policy.includes('\n')) {
        policyConfig = parsePolicy(request.policy);
      } else {
        // Treat as policy name — load from DB
        policyConfig = await loadPolicy(customerId, request.policy);
        if (!policyConfig) {
          logger.warn({ requestId, policyName: request.policy }, 'Policy not found');
        }
      }
    } catch (err) {
      logger.error({ requestId, err: (err as Error).message }, 'Failed to parse/load policy');
    }
  }

  // Step 4: Scan output if provided
  let outputVerdict: OutputScanResult | undefined;
  let safeOutput: string | undefined;

  if (request.output) {
    outputVerdict = await scanOutput(request.output, {
      policy: policyConfig ?? undefined,
      systemPrompt: request.system_prompt,
      canaryTokens: request.canary_tokens,
    });

    if (outputVerdict.cleanedOutput) {
      safeOutput = outputVerdict.cleanedOutput;
    } else if (outputVerdict.verdict !== 'block') {
      safeOutput = request.output;
    }
  }

  // Step 5: Collect policy results
  const policyResults: PolicyResult[] = outputVerdict?.policyViolations.map((v) => ({
    policyName: v.policyName,
    passed: false,
    action: v.action,
    severity: v.severity,
    detail: v.detail,
  })) ?? [];

  const latencyMs = Math.round(performance.now() - pipelineStart);
  const degraded = inputResult.degraded;

  // Step 6: Log to PostgreSQL (fire and forget)
  logGuardResult({
    requestId,
    inputHash: sha256(request.input),
    inputLength: request.input.length,
    outputHash: request.output ? sha256(request.output) : null,
    outputLength: request.output?.length ?? null,
    inputVerdict: inputVerdict.verdict,
    outputVerdict: outputVerdict?.verdict ?? null,
    inputRiskScore: inputVerdict.risk_score,
    outputRiskScore: outputVerdict ? (outputVerdict.promptLeakScore + (outputVerdict.piiDetected.length > 0 ? 0.5 : 0)) : null,
    policyName: policyConfig?.name ?? null,
    policyViolations: policyResults.filter((r) => !r.passed),
    piiDetected: outputVerdict?.piiDetected ?? [],
    promptLeakScore: outputVerdict?.promptLeakScore ?? null,
    canaryDetected: outputVerdict?.canaryDetected ?? false,
    latencyMs,
    degraded,
    apiKeyId,
    customerId,
  }).catch((err) => {
    logger.error({ requestId, err }, 'Failed to log guard result');
  });

  return {
    request_id: requestId,
    input_verdict: inputVerdict,
    output_verdict: outputVerdict,
    safe_output: safeOutput,
    policy_results: policyResults,
    degraded,
    latency_ms: latencyMs,
  };
}

/**
 * Log guard result to PostgreSQL.
 */
async function logGuardResult(data: {
  requestId: string;
  inputHash: string;
  inputLength: number;
  outputHash: string | null;
  outputLength: number | null;
  inputVerdict: string;
  outputVerdict: string | null;
  inputRiskScore: number;
  outputRiskScore: number | null;
  policyName: string | null;
  policyViolations: unknown[];
  piiDetected: unknown[];
  promptLeakScore: number | null;
  canaryDetected: boolean;
  latencyMs: number;
  degraded: boolean;
  apiKeyId: string;
  customerId: string;
}): Promise<void> {
  await prisma.guardLog.create({
    data: {
      requestId: data.requestId,
      inputHash: data.inputHash,
      inputLength: data.inputLength,
      outputHash: data.outputHash,
      outputLength: data.outputLength,
      inputVerdict: data.inputVerdict,
      outputVerdict: data.outputVerdict,
      inputRiskScore: data.inputRiskScore,
      outputRiskScore: data.outputRiskScore,
      policyName: data.policyName,
      policyViolations: data.policyViolations as any,
      piiDetected: data.piiDetected as any,
      promptLeakScore: data.promptLeakScore,
      canaryDetected: data.canaryDetected,
      latencyMs: data.latencyMs,
      degraded: data.degraded,
      apiKeyId: data.apiKeyId,
      customerId: data.customerId,
    },
  });
}
