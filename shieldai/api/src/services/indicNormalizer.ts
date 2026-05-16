/**
 * Indic language normalizer — converts romanized Hindi/Tamil/Telugu
 * to native script and detects code-mixed (Hinglish) input.
 * This is Layer 5 of the preprocessor pipeline.
 */

import {
  transliterateToDevanagari,
  transliterateToTamil,
  transliterateToTelugu,
  detectScript,
  HINDI_INJECTION_KEYWORDS,
  TAMIL_INJECTION_KEYWORDS,
} from '../utils/transliteration';

export interface IndicNormalizerResult {
  transliterated: string | null;
  detectedLanguage: string;
  detectedScript: string;
  isCodeMixed: boolean;
  injectionKeywordsFound: string[];
}

// Hindi word patterns commonly found in romanized text
const HINDI_WORD_PATTERN = /\b(kya|hai|hain|mein|main|mai|mujhe|tum|tumhare|aap|aapka|kaise|kaun|kaha|yeh|woh|nahi|nahin|bhi|aur|lekin|par|se|ko|ka|ki|ke|hum|humara|mere|tera|iske|uska|sabhi|saare|sab|poore|kripya|dhanyavad|namaste|bahut|accha|bura|bada|chhota|pehle|baad|upar|neeche|andar|bahar|yahan|wahan)\b/gi;

// Tamil word patterns
const TAMIL_WORD_PATTERN = /\b(enna|epdi|yaar|inge|ange|nalla|periya|siriya|romba|konjam|sollu|podu|vaanga|ponga|irukku|illai|theriyum|theriyathu|ungal|ungaluku|enakkum|avarkal|ithu|athu)\b/gi;

// Telugu word patterns
const TELUGU_WORD_PATTERN = /\b(emi|ela|evaru|ikkada|akkada|manchi|pedda|chinna|chala|koncham|cheppu|raaa|randi|undi|ledu|teliyadu|meeru|meeku|naaku|vaallu|idi|adi)\b/gi;

// English technical/injection terms that indicate code-mixing when surrounded by Hindi
const ENGLISH_INJECTION_TERMS = /\b(system\s*prompt|instructions?|ignore|override|bypass|unrestricted|admin|developer|reveal|output|rules?|token|secret|password|API\s*key|configuration|access)\b/gi;

/**
 * Detect if text contains code-mixed (Hinglish/Tanglish) content
 * by looking for language-switch boundaries within the same text.
 */
function detectCodeMixing(text: string): { isMixed: boolean; langs: string[] } {
  const langs: string[] = [];
  const script = detectScript(text);

  // If native script is present alongside Latin, it's mixed
  if (script === 'mixed') {
    return { isMixed: true, langs: ['mixed'] };
  }

  // For Latin-only text, check if Hindi/Tamil/Telugu words co-occur with English
  const hindiWords = text.match(HINDI_WORD_PATTERN);
  const tamilWords = text.match(TAMIL_WORD_PATTERN);
  const teluguWords = text.match(TELUGU_WORD_PATTERN);
  const englishInjection = text.match(ENGLISH_INJECTION_TERMS);

  if (hindiWords && hindiWords.length >= 2) langs.push('hi');
  if (tamilWords && tamilWords.length >= 2) langs.push('ta');
  if (teluguWords && teluguWords.length >= 2) langs.push('te');
  if (englishInjection) langs.push('en');

  const isMixed = langs.length >= 2 || (langs.includes('hi') && englishInjection !== null);

  return { isMixed, langs };
}

/**
 * Detect romanized Indic injection keywords in text.
 */
function findInjectionKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const [category, variants] of Object.entries(HINDI_INJECTION_KEYWORDS)) {
    for (const variant of variants) {
      if (lower.includes(variant)) {
        found.push(`hi:${category}:${variant}`);
      }
    }
  }
  for (const [category, variants] of Object.entries(TAMIL_INJECTION_KEYWORDS)) {
    for (const variant of variants) {
      if (lower.includes(variant)) {
        found.push(`ta:${category}:${variant}`);
      }
    }
  }

  return found;
}

/**
 * Guess the primary Indic language from romanized text.
 */
function guessIndicLanguage(text: string): string {
  const script = detectScript(text);

  if (script === 'devanagari') return 'hi';
  if (script === 'tamil') return 'ta';
  if (script === 'telugu') return 'te';
  if (script === 'bengali') return 'bn';

  // For Latin script, count Indic word matches
  const hindiCount = (text.match(HINDI_WORD_PATTERN) || []).length;
  const tamilCount = (text.match(TAMIL_WORD_PATTERN) || []).length;
  const teluguCount = (text.match(TELUGU_WORD_PATTERN) || []).length;

  const max = Math.max(hindiCount, tamilCount, teluguCount);
  if (max < 2) return 'en'; // not enough Indic signal

  if (hindiCount === max) return 'hi';
  if (tamilCount === max) return 'ta';
  if (teluguCount === max) return 'te';

  return 'en';
}

/**
 * Main normalization function.
 * Detects language, checks for code-mixing, transliterates if needed,
 * and identifies injection keywords.
 */
export function normalizeIndic(text: string): IndicNormalizerResult {
  const script = detectScript(text);
  const language = guessIndicLanguage(text);
  const { isMixed } = detectCodeMixing(text);
  const injectionKeywordsFound = findInjectionKeywords(text);

  let transliterated: string | null = null;

  // Transliterate Latin-script Indic text to native script
  if (script === 'latin' && language !== 'en') {
    switch (language) {
      case 'hi':
        transliterated = transliterateToDevanagari(text);
        break;
      case 'ta':
        transliterated = transliterateToTamil(text);
        break;
      case 'te':
        transliterated = transliterateToTelugu(text);
        break;
    }
  }

  // Determine the effective language code
  let detectedLanguage = language;
  if (isMixed && language === 'hi') detectedLanguage = 'hi-en';

  return {
    transliterated,
    detectedLanguage,
    detectedScript: script,
    isCodeMixed: isMixed,
    injectionKeywordsFound,
  };
}
