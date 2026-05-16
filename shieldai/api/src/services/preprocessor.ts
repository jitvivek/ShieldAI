/**
 * Preprocessor Service — Normalizes input through 4 sequential layers:
 * 1. Unicode normalization + homoglyph replacement
 * 2. Encoding detection and recursive decoding (max depth 3)
 * 3. Leetspeak de-mapping
 * 4. Whitespace/invisible character stripping
 *
 * Outputs both original and normalized text for downstream analysis.
 */

import { PreprocessorResult } from '../types/detection';
import { expandDangerousAcronyms } from '../utils/acronyms';
import { decodeAllEncodings, decodeEmbeddedBase64 } from '../utils/encoding';
import { deLeetspeak } from '../utils/leetspeak';
import { normalizeUnicode, stripInvisibleChars, normalizeWhitespace } from '../utils/unicode';

/**
 * Run the full 4-layer preprocessing pipeline on input text.
 */
export function preprocess(input: string): PreprocessorResult {
  const start = performance.now();
  const original = input;

  // Layer 1: Unicode normalization + homoglyph replacement
  const unicodeResult = normalizeUnicode(input);
  let text = unicodeResult.normalized;
  const homoglyphsFound = unicodeResult.homoglyphsFound;

  // Layer 2: Encoding detection and recursive decoding
  // First try decoding the entire text
  const decodingResult = decodeAllEncodings(text, 3);
  text = decodingResult.decoded;
  const encodingsDetected = [...decodingResult.encodingsFound];

  // Then scan for embedded Base64 segments within larger text
  const embeddedResult = decodeEmbeddedBase64(text);
  if (embeddedResult.found) {
    text = embeddedResult.decoded;
    if (!encodingsDetected.includes('base64')) {
      encodingsDetected.push('base64');
    }
  }

  // Layer 3: Invisible character stripping (before leetspeak to get clean text)
  const invisibleResult = stripInvisibleChars(text);
  text = invisibleResult.cleaned;
  const invisibleCharsRemoved = invisibleResult.removedCount;

  // Layer 4: Whitespace normalization
  const normalized = normalizeWhitespace(text);

  // Leetspeak de-mapping (produces a separate output)
  const deleetified = normalizeWhitespace(deLeetspeak(normalized));

  // Layer 5: Acronym expansion — expand known dangerous abbreviations
  const acronymResult = expandDangerousAcronyms(normalized);
  const acronymExpanded = acronymResult.expanded;

  const processingTimeMs = Math.round((performance.now() - start) * 100) / 100;

  return {
    original,
    normalized,
    deleetified,
    acronymExpanded,
    encodingsDetected,
    homoglyphsFound,
    invisibleCharsRemoved,
    acronymExpansionsFound: acronymResult.expansionCount,
    processingTimeMs,
  };
}
