/**
 * Shannon entropy analysis for detecting encoded/obfuscated injection attempts.
 */
export function analyzeEntropy(input: string): number {
  if (!input || input.length < 10) return 0;

  const freq = new Map<string, number>();
  for (const ch of input) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }

  const len = input.length;
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / len;
    if (p > 0) entropy -= p * Math.log2(p);
  }

  // Normalize: typical English text ~4.0-4.5 bits, encoded payloads ~5.5-7.0
  // Map to 0-1 scale: anything below 4.0 = 0, above 6.5 = 1
  const normalized = Math.max(0, Math.min(1, (entropy - 4.0) / 2.5));

  // Check for suspicious patterns that boost entropy score
  const hasBase64 = /[A-Za-z0-9+/]{20,}={0,2}/.test(input);
  const hasHexBlocks = /(?:0x[0-9a-f]{2}\s*){4,}/i.test(input);
  const hasUnicodeEscapes = /(?:\\u[0-9a-f]{4}){3,}/i.test(input);

  let boost = 0;
  if (hasBase64) boost += 0.2;
  if (hasHexBlocks) boost += 0.25;
  if (hasUnicodeEscapes) boost += 0.25;

  return Math.min(1, normalized + boost);
}
