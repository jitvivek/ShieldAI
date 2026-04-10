/**
 * Phase 2 — Prompt Shield Service
 * Detects system prompt leakage in LLM outputs using 3 methods:
 * 1. Jaccard 4-gram similarity (>0.30)
 * 2. Embedding cosine similarity (>0.85)
 * 3. Longest common substring ratio (>0.25)
 */

import { logger } from '../config/logger';
import { PromptShieldResult } from '../types/guard';
import { computeSimilarity } from './semanticSimilarity';

/**
 * Generate character n-grams from text.
 */
function ngrams(text: string, n: number): Set<string> {
  const grams = new Set<string>();
  const lower = text.toLowerCase().replace(/\s+/g, ' ');
  for (let i = 0; i <= lower.length - n; i++) {
    grams.add(lower.slice(i, i + n));
  }
  return grams;
}

/**
 * Jaccard similarity between two sets.
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersectionSize = 0;
  for (const item of a) {
    if (b.has(item)) intersectionSize++;
  }
  const unionSize = a.size + b.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

/**
 * Longest common substring ratio — length of LCS / length of system prompt.
 */
function lcsRatio(systemPrompt: string, output: string): number {
  const a = systemPrompt.toLowerCase();
  const b = output.toLowerCase();

  if (a.length === 0) return 0;

  // Sliding window approach for memory efficiency on long texts
  let maxLen = 0;
  const maxA = Math.min(a.length, 2000); // Cap for performance
  const maxB = Math.min(b.length, 5000);

  // Use a rolling array instead of full 2D table
  const prev = new Uint16Array(maxB + 1);
  const curr = new Uint16Array(maxB + 1);

  for (let i = 1; i <= maxA; i++) {
    for (let j = 1; j <= maxB; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1]! + 1;
        if (curr[j]! > maxLen) maxLen = curr[j]!;
      } else {
        curr[j] = 0;
      }
    }
    prev.set(curr);
    curr.fill(0);
  }

  return maxLen / a.length;
}

/**
 * Check if LLM output contains parts of the system prompt.
 */
export async function detectPromptLeak(
  output: string,
  systemPrompt: string,
): Promise<PromptShieldResult> {
  if (!systemPrompt || systemPrompt.length === 0) {
    return { leakDetected: false, leakScore: 0, method: null, detail: 'No system prompt provided' };
  }

  // Layer 1: Jaccard 4-gram similarity
  const outputGrams = ngrams(output, 4);
  const promptGrams = ngrams(systemPrompt, 4);
  const jaccardScore = jaccardSimilarity(promptGrams, outputGrams);

  if (jaccardScore > 0.30) {
    return {
      leakDetected: true,
      leakScore: jaccardScore,
      method: 'jaccard',
      detail: `Jaccard 4-gram similarity ${(jaccardScore * 100).toFixed(1)}% exceeds 30% threshold`,
    };
  }

  // Layer 2: Longest common substring ratio
  const lcsScore = lcsRatio(systemPrompt, output);
  if (lcsScore > 0.25) {
    return {
      leakDetected: true,
      leakScore: lcsScore,
      method: 'lcs',
      detail: `Longest common substring ratio ${(lcsScore * 100).toFixed(1)}% exceeds 25% threshold`,
    };
  }

  // Layer 3: Embedding cosine similarity (async — calls ML sidecar)
  try {
    const semanticResult = await computeSimilarity(output);
    if (semanticResult && semanticResult.score > 0.85) {
      return {
        leakDetected: true,
        leakScore: semanticResult.score,
        method: 'embedding',
        detail: `Embedding similarity ${(semanticResult.score * 100).toFixed(1)}% exceeds 85% threshold`,
      };
    }
  } catch (err) {
    logger.warn({ err: (err as Error).message }, 'Prompt shield embedding check failed — skipping');
  }

  // No leak detected — return highest score for transparency
  const maxScore = Math.max(jaccardScore, lcsScore);
  return {
    leakDetected: false,
    leakScore: maxScore,
    method: null,
    detail: `No significant prompt leakage detected (max similarity: ${(maxScore * 100).toFixed(1)}%)`,
  };
}
