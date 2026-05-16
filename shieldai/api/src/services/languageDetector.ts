/**
 * Language detector — uses script analysis and word frequency heuristics.
 * For production, this delegates to the ML sidecar (fasttext lid.176.bin).
 * Falls back to local heuristic detection if ML sidecar is unavailable.
 */

import { detectScript } from '../utils/transliteration';
import { getEnv } from '../config/env';
import { logger } from '../config/logger';

export interface LanguageDetectionResult {
  language: string;          // ISO 639-1: en, hi, ta, te, bn, hi-en, etc.
  script: string;            // latin, devanagari, tamil, telugu, bengali, mixed
  confidence: number;        // 0.0 - 1.0
  isCodeMixed: boolean;
  detectedVia: 'ml_sidecar' | 'local_heuristic';
}

// Hindi word frequency list (romanized)
const HINDI_MARKERS = /\b(kya|hai|hain|hoon|mein|mujhe|tumhare|aapka|nahi|nahin|bhi|aur|lekin|sabhi|saare|kripya|namaste|bahut|accha|pehle|baad|yahan|wahan|bhai|yaar|dekh|sun|bol|chal|kar|karo|karna|ho|hota|hoti|raha|rahi|rahe|tha|thi|the|wala|wali|wale|dena|lena|jana|aana)\b/gi;

const TAMIL_MARKERS = /\b(enna|epdi|yaar|inge|ange|nalla|romba|konjam|sollu|vaanga|ponga|irukku|illai|theriyum|ungal|enakku|ithu|athu|intha|antha|vera|mattum|thaan)\b/gi;

const TELUGU_MARKERS = /\b(emi|ela|evaru|ikkada|akkada|manchi|chala|koncham|cheppu|undi|ledu|teliyadu|meeru|naaku|vaallu|idi|adi|eedhi|adhi|mari|aithe|kaani)\b/gi;

const BENGALI_MARKERS = /\b(ki|keno|kothay|ekhane|okhane|bhalo|boro|chhoto|onek|ektu|bolo|aasho|jao|aacho|nei|jani|aapnar|aamaar|ora|eta|ota)\b/gi;

/**
 * Attempt ML sidecar language detection via HTTP.
 */
async function detectViaMlSidecar(text: string): Promise<LanguageDetectionResult | null> {
  try {
    const env = getEnv();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.ML_SERVICE_TIMEOUT_MS);

    const response = await fetch(`${env.ML_SERVICE_URL}/detect-language`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = await response.json() as {
      language: string;
      confidence: number;
      is_code_mixed: boolean;
    };

    const script = detectScript(text);
    return {
      language: data.is_code_mixed ? `${data.language}-en` : data.language,
      script,
      confidence: data.confidence,
      isCodeMixed: data.is_code_mixed,
      detectedVia: 'ml_sidecar',
    };
  } catch (err) {
    logger.debug({ err }, 'ML sidecar language detection unavailable, using local heuristic');
    return null;
  }
}

/**
 * Local heuristic language detection — counts word matches per language.
 */
function detectLocal(text: string): LanguageDetectionResult {
  const script = detectScript(text);

  // Native scripts are definitive
  if (script === 'devanagari') return { language: 'hi', script, confidence: 0.95, isCodeMixed: false, detectedVia: 'local_heuristic' };
  if (script === 'tamil') return { language: 'ta', script, confidence: 0.95, isCodeMixed: false, detectedVia: 'local_heuristic' };
  if (script === 'telugu') return { language: 'te', script, confidence: 0.95, isCodeMixed: false, detectedVia: 'local_heuristic' };
  if (script === 'bengali') return { language: 'bn', script, confidence: 0.95, isCodeMixed: false, detectedVia: 'local_heuristic' };

  // Mixed script
  if (script === 'mixed') {
    return { language: 'hi-en', script, confidence: 0.80, isCodeMixed: true, detectedVia: 'local_heuristic' };
  }

  // Latin script — count word markers
  const counts: Record<string, number> = {
    hi: (text.match(HINDI_MARKERS) || []).length,
    ta: (text.match(TAMIL_MARKERS) || []).length,
    te: (text.match(TELUGU_MARKERS) || []).length,
    bn: (text.match(BENGALI_MARKERS) || []).length,
  };

  const totalIndic = Object.values(counts).reduce((a, b) => a + b, 0);
  const words = text.split(/\s+/).length;

  if (totalIndic < 2 || totalIndic / words < 0.1) {
    return { language: 'en', script: 'latin', confidence: 0.85, isCodeMixed: false, detectedVia: 'local_heuristic' };
  }

  const topLang = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const indicRatio = totalIndic / words;
  const isCodeMixed = indicRatio > 0.1 && indicRatio < 0.7;

  return {
    language: isCodeMixed ? `${topLang[0]}-en` : topLang[0],
    script: 'latin',
    confidence: Math.min(0.9, 0.5 + indicRatio),
    isCodeMixed,
    detectedVia: 'local_heuristic',
  };
}

/**
 * Detect language — tries ML sidecar first, falls back to local heuristic.
 */
export async function detectLanguage(text: string): Promise<LanguageDetectionResult> {
  const mlResult = await detectViaMlSidecar(text);
  if (mlResult) return mlResult;
  return detectLocal(text);
}

/**
 * Synchronous local-only detection (for use in preprocessor).
 */
export function detectLanguageLocal(text: string): LanguageDetectionResult {
  return detectLocal(text);
}
