/**
 * Shannon Entropy Analyzer — Detects anomalous text segments that
 * may indicate encoded payloads, obfuscated instructions, or unusual content.
 *
 * Normal English text: ~4.0-4.5 bits/char
 * Base64 text: ~5.9-6.0 bits/char
 * Hex-encoded text: ~3.7 bits/char
 * Binary ASCII: ~1.0 bits/char
 */

import { EntropyResult } from '../types/detection';

/**
 * Compute Shannon entropy for a string.
 * Returns bits per character.
 */
export function shannonEntropy(text: string): number {
  if (text.length === 0) return 0;

  const freq: Record<string, number> = {};
  for (const char of text) {
    freq[char] = (freq[char] ?? 0) + 1;
  }

  let entropy = 0;
  const len = text.length;

  for (const count of Object.values(freq)) {
    const p = count / len;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  return entropy;
}

/**
 * Classify a segment's entropy as a probable encoding type.
 */
function classifyEntropy(entropy: number, text: string): string | null {
  // Binary ASCII: very low entropy, only 0s and 1s
  if (entropy < 1.5 && /^[01\s]+$/.test(text)) {
    return 'binary';
  }

  // Hex encoded: moderate entropy, hex charset
  if (entropy >= 3.5 && entropy <= 4.0 && /^[0-9a-fA-F\s\\x]+$/.test(text)) {
    return 'hex';
  }

  // Base64: high entropy, Base64 charset
  if (entropy >= 5.5 && /^[A-Za-z0-9+/=\s]+$/.test(text)) {
    return 'base64';
  }

  return null;
}

/**
 * Split text into segments for per-segment entropy analysis.
 * Splits on paragraph breaks, code blocks, and long whitespace gaps.
 */
function segmentText(text: string): string[] {
  // Split on double newlines, code block markers, or long whitespace sequences
  const segments = text
    .split(/\n{2,}|```[\s\S]*?```|\t{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10); // Ignore very short segments

  // If no good split points, split into chunks of ~200 chars at word boundaries
  if (segments.length <= 1 && text.length > 200) {
    const chunks: string[] = [];
    const words = text.split(/\s+/);
    let current = '';

    for (const word of words) {
      if (current.length + word.length > 200) {
        if (current.length > 10) chunks.push(current.trim());
        current = word;
      } else {
        current += (current ? ' ' : '') + word;
      }
    }
    if (current.length > 10) chunks.push(current.trim());

    return chunks.length > 0 ? chunks : [text];
  }

  return segments.length > 0 ? segments : [text];
}

/**
 * Analyze the entropy of input text.
 * Segments the text, computes per-segment entropy, and flags anomalies.
 */
export function analyzeEntropy(text: string): EntropyResult {
  const overallEntropy = shannonEntropy(text);
  const segments = segmentText(text);

  const segmentEntropies = segments.map((segment) => {
    const entropy = shannonEntropy(segment);
    const encoding = classifyEntropy(entropy, segment);
    return {
      text: segment.substring(0, 80), // Truncate for response safety
      entropy: Math.round(entropy * 1000) / 1000,
      encoding,
    };
  });

  // Anomaly detection:
  // - Overall entropy > 5.5 suggests encoded/obfuscated content
  // - Overall entropy < 2.0 suggests binary or highly repetitive content
  // - Any segment with entropy > 5.5 or < 2.0 is suspicious
  const anomalousSegments = segmentEntropies.filter(
    (s) => s.entropy > 5.5 || (s.entropy < 2.0 && s.entropy > 0),
  );

  const isAnomalous =
    overallEntropy > 5.5 || overallEntropy < 2.0 || anomalousSegments.length > 0;

  // Compute anomaly score (0.0 - 1.0)
  let anomalyScore = 0;

  if (overallEntropy > 5.5) {
    // High entropy: likely encoded content
    anomalyScore = Math.min(1.0, (overallEntropy - 5.5) / 0.7);
  } else if (overallEntropy < 2.0 && overallEntropy > 0) {
    // Low entropy: binary or highly repetitive
    anomalyScore = Math.min(1.0, (2.0 - overallEntropy) / 2.0);
  }

  // Boost score if individual segments are anomalous even if overall isn't
  if (anomalousSegments.length > 0) {
    const segmentBoost = Math.min(0.3, anomalousSegments.length * 0.1);
    anomalyScore = Math.min(1.0, anomalyScore + segmentBoost);
  }

  return {
    overallEntropy: Math.round(overallEntropy * 1000) / 1000,
    isAnomalous,
    anomalyScore: Math.round(anomalyScore * 1000) / 1000,
    segmentEntropies,
  };
}
