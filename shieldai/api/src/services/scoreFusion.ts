/**
 * Score Fusion Engine — Combines all detection signals into a single risk score.
 * Uses weighted fusion with rule engine veto power on known signatures.
 */

import { getEnv } from '../config/env';
import { RiskScore, Verdict } from '../types/detection';

/**
 * Compute a fused risk score from all detection signal scores.
 *
 * Weights:
 * - Rule engine: 15% (but gets veto power above 0.9)
 * - ML classifier: 50%
 * - Entropy analyzer: 15%
 * - Semantic similarity: 20%
 *
 * If ML or semantic is unavailable (null), redistribute their weight
 * to the remaining signals proportionally.
 */
export function computeRiskScore(
  ruleScore: number,
  mlScore: number | null,
  entropyAnomaly: number,
  semanticSim: number | null,
): RiskScore {
  // Rule engine gets veto power on known signatures
  if (ruleScore > 0.9) {
    return { score: Math.min(0.95, ruleScore), source: 'rule_veto' };
  }

  // Determine available signals and compute weighted fusion
  const signals: Array<{ score: number; weight: number }> = [
    { score: ruleScore, weight: 0.15 },
    { score: entropyAnomaly, weight: 0.15 },
  ];

  if (mlScore !== null) {
    signals.push({ score: mlScore, weight: 0.50 });
  }

  if (semanticSim !== null) {
    signals.push({ score: semanticSim, weight: 0.20 });
  }

  // Normalize weights if some signals are missing
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
  const fused = signals.reduce((sum, s) => sum + (s.score * s.weight) / totalWeight, 0);

  return { score: Math.min(1.0, Math.round(fused * 1000) / 1000), source: 'weighted_fusion' };
}

/**
 * Determine the verdict based on the risk score and configurable thresholds.
 * - score < THRESHOLD_SAFE → "pass"
 * - THRESHOLD_SAFE ≤ score < THRESHOLD_SUSPICIOUS → "flag"
 * - score ≥ THRESHOLD_SUSPICIOUS → "block"
 */
export function determineVerdict(score: number, customThreshold?: number): Verdict {
  const env = getEnv();
  const safeThreshold = customThreshold ?? env.THRESHOLD_SAFE;
  const suspiciousThreshold = env.THRESHOLD_SUSPICIOUS;

  if (score < safeThreshold) {
    return 'pass';
  } else if (score < suspiciousThreshold) {
    return 'flag';
  } else {
    return 'block';
  }
}

/**
 * Generate a human-readable explanation for the verdict.
 */
export function generateExplanation(
  verdict: Verdict,
  ruleScore: number,
  mlScore: number | null,
  entropyAnomaly: number,
  semanticSim: number | null,
  matchedRuleIds: string[],
  structuralFlags: string[],
): string {
  const parts: string[] = [];

  if (verdict === 'pass') {
    return 'Input appears safe. No significant injection patterns detected.';
  }

  if (ruleScore > 0.9) {
    parts.push(
      `High-confidence rule match (${matchedRuleIds.slice(0, 3).join(', ')})`,
    );
  } else if (ruleScore > 0.5) {
    parts.push(
      `Pattern matches found: ${matchedRuleIds.slice(0, 3).join(', ')}`,
    );
  }

  if (mlScore !== null && mlScore > 0.7) {
    parts.push(`ML classifier flagged as high risk (confidence: ${(mlScore * 100).toFixed(0)}%)`);
  }

  if (semanticSim !== null && semanticSim > 0.85) {
    parts.push('High semantic similarity to known injection patterns');
  } else if (semanticSim !== null && semanticSim > 0.6) {
    parts.push('Moderate semantic similarity to known injection patterns');
  }

  if (entropyAnomaly > 0.5) {
    parts.push('Anomalous text entropy detected (possible encoding/obfuscation)');
  }

  if (structuralFlags.length > 0) {
    parts.push(
      `Structural injection markers found: ${structuralFlags.slice(0, 3).join(', ')}`,
    );
  }

  if (parts.length === 0) {
    return verdict === 'flag'
      ? 'Input shows minor suspicious patterns. Manual review recommended.'
      : 'Input matches known injection patterns with high confidence.';
  }

  return parts.join('. ') + '.';
}
