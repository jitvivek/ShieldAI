/**
 * Detection Pipeline — Orchestrates the full prompt injection detection flow.
 * Runs all analysis layers in parallel for minimum latency.
 *
 * Pipeline steps:
 * 1. Preprocess input → normalized text
 * 2. Run rule engine (parallel)
 * 3. Run ML classifier (parallel)
 * 4. Run entropy analysis (parallel)
 * 5. Run semantic similarity (parallel)
 * 6. Fuse all scores
 * 7. Determine verdict
 * 8. Log result to PostgreSQL
 * 9. Return response
 */

import { PrismaClient } from '@prisma/client';

import { logger } from '../config/logger';
import {
  PipelineResult,
  DetectConfig,
  RuleEngineResult,
  MLClassifierResult,
  EntropyResult,
  SemanticSimilarityResult,
} from '../types/detection';
import { detectAcrostic } from '../utils/acrostic';
import { sha256 } from '../utils/crypto';

import { analyzeEntropy } from './entropyAnalyzer';
import { normalizeIndic } from './indicNormalizer';
import { detectLanguage } from './languageDetector';
import { classify as mlClassify } from './mlClassifier';
import { scanForPii } from './piiScanner';
import { preprocess } from './preprocessor';
import { evaluate as ruleEvaluate } from './ruleEngine';
import { computeRiskScore, determineVerdict, generateExplanation } from './scoreFusion';
import { computeSimilarity } from './semanticSimilarity';

const prisma = new PrismaClient();

/**
 * Run the full detection pipeline on an input string.
 * All heavy analysis runs in parallel via Promise.allSettled.
 */
export async function runPipeline(
  input: string,
  requestId: string,
  apiKeyId: string,
  customerId: string,
  config?: DetectConfig,
): Promise<PipelineResult> {
  const pipelineStart = performance.now();

  // Step 1: Preprocess
  const preprocessed = preprocess(input);

  // Step 1a: Language detection and Indic normalization
  const langResult = await detectLanguage(input);
  let normalizedInput = preprocessed.normalized;
  if (langResult.language !== 'en') {
    const indicResult = normalizeIndic(input);
    normalizedInput = indicResult.transliterated ?? preprocessed.normalized;
  }

  // Step 1b: PII scanning
  const piiResult = scanForPii(input);

  // Step 1c: Acrostic detection — check for hidden dangerous keywords
  const acrosticResult = detectAcrostic(input);
  if (acrosticResult.detected) {
    logger.warn(
      {
        requestId,
        extractedWord: acrosticResult.extractedWord,
        method: acrosticResult.method,
      },
      'Acrostic pattern detected — hidden dangerous keyword found',
    );
  }

  logger.debug(
    {
      requestId,
      preprocessTimeMs: preprocessed.processingTimeMs,
      encodings: preprocessed.encodingsDetected,
      homoglyphs: preprocessed.homoglyphsFound,
      invisibleChars: preprocessed.invisibleCharsRemoved,
      acronymExpansions: preprocessed.acronymExpansionsFound,
    },
    'Preprocessing complete',
  );

  // Steps 2-5: Run all detection layers in parallel
  const [ruleResult, mlResult, entropyResult, semanticResult] = await Promise.allSettled([
    // Step 2: Rule engine (sync, but wrapped in promise for allSettled)
    Promise.resolve(ruleEvaluate(preprocessed.normalized, preprocessed.deleetified, preprocessed.acronymExpanded)),

    // Step 3: ML classifier (async — calls ML sidecar)
    mlClassify(preprocessed.original, preprocessed.normalized),

    // Step 4: Entropy analysis (sync, wrapped)
    Promise.resolve(analyzeEntropy(preprocessed.normalized)),

    // Step 5: Semantic similarity (async — calls ML sidecar)
    // Use acronym-expanded text for better matching of abbreviated dangerous terms
    computeSimilarity(preprocessed.acronymExpanded || preprocessed.normalized),
  ]);

  // Extract results, handling failures gracefully
  const rules: RuleEngineResult =
    ruleResult.status === 'fulfilled'
      ? ruleResult.value
      : { score: 0, matchedRules: [], structuralFlags: [], processingTimeMs: 0 };

  const ml: MLClassifierResult | null =
    mlResult.status === 'fulfilled' ? mlResult.value : null;

  const entropy: EntropyResult =
    entropyResult.status === 'fulfilled'
      ? entropyResult.value
      : { overallEntropy: 0, isAnomalous: false, anomalyScore: 0, segmentEntropies: [] };

  const semantic: SemanticSimilarityResult | null =
    semanticResult.status === 'fulfilled' ? semanticResult.value : null;

  // Log any failures
  if (ruleResult.status === 'rejected') {
    logger.error({ requestId, err: ruleResult.reason }, 'Rule engine failed');
  }
  if (mlResult.status === 'rejected') {
    logger.warn({ requestId, err: mlResult.reason }, 'ML classifier failed');
  }
  if (entropyResult.status === 'rejected') {
    logger.error({ requestId, err: entropyResult.reason }, 'Entropy analyzer failed');
  }
  if (semanticResult.status === 'rejected') {
    logger.warn({ requestId, err: semanticResult.reason }, 'Semantic similarity failed');
  }

  // Step 5b: Boost rule score if acrostic detected a dangerous keyword
  let effectiveRuleScore = rules.score;
  if (acrosticResult.detected) {
    effectiveRuleScore = Math.max(effectiveRuleScore, 0.92);
    rules.structuralFlags.push(`acrostic_${acrosticResult.method}:${acrosticResult.extractedWord}`);
    if (!rules.matchedRules.some((r) => r.category === 'harmful_content')) {
      rules.matchedRules.push({
        ruleId: 'ACRO01',
        category: 'harmful_content',
        severity: 'critical',
        weight: 0.92,
        matchedText: acrosticResult.extractedWord!,
        pattern: `acrostic:${acrosticResult.method}`,
      });
    }
  }

  // Step 6: Fuse scores
  const riskScoreResult = computeRiskScore(
    effectiveRuleScore,
    ml?.score ?? null,
    entropy.anomalyScore,
    semantic?.score ?? null,
  );

  // Step 7: Determine verdict
  const verdict = determineVerdict(riskScoreResult.score, config?.threshold);
  const degraded = ml === null;

  // Determine primary category from matched rules
  const category = rules.matchedRules.length > 0 ? rules.matchedRules[0]!.category : null;
  const subcategory =
    rules.matchedRules.length > 0 ? rules.matchedRules[0]!.ruleId : null;

  // Generate explanation
  const explanation = generateExplanation(
    verdict,
    rules.score,
    ml?.score ?? null,
    entropy.anomalyScore,
    semantic?.score ?? null,
    rules.matchedRules.map((r) => r.ruleId),
    rules.structuralFlags,
  );

  const latencyMs = Math.round(performance.now() - pipelineStart);

  // Step 8: Log to PostgreSQL (fire and forget — don't block response)
  logScan({
    requestId,
    inputHash: sha256(input),
    inputLength: input.length,
    verdict,
    riskScore: riskScoreResult.score,
    category,
    ruleScore: effectiveRuleScore,
    mlScore: ml?.score ?? null,
    entropyScore: entropy.anomalyScore,
    semanticScore: semantic?.score ?? null,
    matchedRules: rules.matchedRules.map((r) => r.ruleId),
    latencyMs,
    degraded,
    apiKeyId,
    customerId,
    detectedLanguage: langResult.language,
    isCodeMixed: langResult.isCodeMixed ?? false,
    classifierUsed: langResult.language !== 'en' ? 'muril' : 'deberta',
    piiDetected: piiResult.matches.length > 0 ? piiResult.matches.map((m) => m.type) : [],
  }).catch((err) => {
    logger.error({ requestId, err }, 'Failed to log scan result');
  });

  // Step 9: Build response
  return {
    requestId,
    verdict,
    riskScore: riskScoreResult.score,
    category,
    subcategory,
    explanation,
    degraded,
    breakdown: {
      rule_engine: {
        score: effectiveRuleScore,
        matched_rules: rules.matchedRules.map((r) => r.ruleId),
        structural_flags: rules.structuralFlags,
      },
      ml_classifier: ml
        ? {
            score: ml.score,
            label: ml.label,
            confidence: ml.confidence,
          }
        : null,
      semantic_similarity: semantic
        ? {
            score: semantic.score,
            nearest_pattern: semantic.nearestPattern,
          }
        : null,
      entropy: {
        score: entropy.anomalyScore,
        status: entropy.isAnomalous ? 'anomalous' : 'normal',
      },
    },
    preprocessing: {
      encodings_detected: preprocessed.encodingsDetected,
      homoglyphs_found: preprocessed.homoglyphsFound,
      invisible_chars_removed: preprocessed.invisibleCharsRemoved,
    },
    pii: {
      detected: piiResult.matches.length > 0,
      types: piiResult.matches.map((m) => m.type),
      count: piiResult.matches.length,
    },
    language: {
      detected: langResult.language,
      is_code_mixed: langResult.isCodeMixed ?? false,
      classifier_used: langResult.language !== 'en' ? 'muril' : 'deberta',
    },
    latencyMs,
    ruleEngineResult: rules,
    mlResult: ml,
    entropyResult: entropy,
    semanticResult: semantic,
  };
}

/**
 * Log scan result to PostgreSQL.
 */
async function logScan(data: {
  requestId: string;
  inputHash: string;
  inputLength: number;
  verdict: string;
  riskScore: number;
  category: string | null;
  ruleScore: number;
  mlScore: number | null;
  entropyScore: number;
  semanticScore: number | null;
  matchedRules: string[];
  latencyMs: number;
  degraded: boolean;
  apiKeyId: string;
  customerId: string;
  detectedLanguage: string;
  isCodeMixed: boolean;
  classifierUsed: string;
  piiDetected: string[];
}): Promise<void> {
  await prisma.scanLog.create({
    data: {
      requestId: data.requestId,
      inputHash: data.inputHash,
      inputLength: data.inputLength,
      verdict: data.verdict,
      riskScore: data.riskScore,
      category: data.category,
      ruleScore: data.ruleScore,
      mlScore: data.mlScore,
      entropyScore: data.entropyScore,
      semanticScore: data.semanticScore,
      matchedRules: data.matchedRules,
      latencyMs: data.latencyMs,
      degraded: data.degraded,
      apiKeyId: data.apiKeyId,
      customerId: data.customerId,
      detectedLanguage: data.detectedLanguage,
      isCodeMixed: data.isCodeMixed,
      classifierUsed: data.classifierUsed,
      piiDetected: data.piiDetected,
    },
  });
}
