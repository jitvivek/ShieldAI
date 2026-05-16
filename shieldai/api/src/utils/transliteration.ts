/**
 * Romanized Indic → native script transliteration maps.
 * Covers Hindi (Devanagari), Tamil, and Telugu.
 * Used by the Indic normalizer to convert Latin-script Indian text
 * back to native script for pattern matching.
 */

// HINDI: Romanized → Devanagari
// Sorted longest-first to avoid partial matches
export const HINDI_TRANSLIT_MAP: [string, string][] = [
  // Conjuncts / multi-char first
  ['ksha', 'क्ष'], ['gya', 'ज्ञ'], ['tra', 'त्र'], ['shra', 'श्र'],
  // Aspirated consonants
  ['kha', 'ख'], ['gha', 'घ'], ['chha', 'छ'], ['jha', 'झ'],
  ['tha', 'ठ'], ['dha', 'ध'], ['pha', 'फ'], ['bha', 'भ'],
  ['cha', 'च'], ['shh', 'ष'],
  // Consonants
  ['ka', 'क'], ['ga', 'ग'], ['ja', 'ज'], ['ta', 'ट'],
  ['da', 'ड'], ['na', 'न'], ['pa', 'प'], ['ba', 'ब'],
  ['ma', 'म'], ['ya', 'य'], ['ra', 'र'], ['la', 'ल'],
  ['va', 'व'], ['wa', 'व'], ['sha', 'श'], ['sa', 'स'],
  ['ha', 'ह'],
  // Single consonants (without inherent vowel marker, for end-of-word)
  ['k', 'क्'], ['g', 'ग्'], ['j', 'ज्'], ['t', 'ट्'],
  ['d', 'ड्'], ['n', 'न्'], ['p', 'प्'], ['b', 'ब्'],
  ['m', 'म्'], ['r', 'र्'], ['l', 'ल्'], ['s', 'स्'],
  ['h', 'ह्'],
  // Vowels (independent)
  ['aa', 'आ'], ['ai', 'ऐ'], ['au', 'औ'], ['ee', 'ई'],
  ['oo', 'ऊ'], ['ou', 'औ'],
  ['a', 'अ'], ['i', 'इ'], ['u', 'उ'], ['e', 'ए'], ['o', 'ओ'],
];

// TAMIL: Romanized → Tamil script
export const TAMIL_TRANSLIT_MAP: [string, string][] = [
  ['nga', 'ங'], ['nya', 'ஞ'], ['nna', 'ண'],
  ['tha', 'த'], ['dha', 'த'], ['cha', 'ச'], ['sha', 'ஷ'],
  ['ka', 'க'], ['ga', 'க'], ['ja', 'ஜ'], ['ta', 'ட'],
  ['da', 'ட'], ['na', 'ந'], ['pa', 'ப'], ['ba', 'ப'],
  ['ma', 'ம'], ['ya', 'ய'], ['ra', 'ர'], ['la', 'ல'],
  ['va', 'வ'], ['sa', 'ச'], ['ha', 'ஹ'],
  ['aa', 'ஆ'], ['ai', 'ஐ'], ['au', 'ஔ'], ['ee', 'ஈ'],
  ['oo', 'ஊ'],
  ['a', 'அ'], ['i', 'இ'], ['u', 'உ'], ['e', 'எ'], ['o', 'ஒ'],
];

// TELUGU: Romanized → Telugu script
export const TELUGU_TRANSLIT_MAP: [string, string][] = [
  ['kha', 'ఖ'], ['gha', 'ఘ'], ['cha', 'చ'], ['jha', 'ఝ'],
  ['tha', 'ఠ'], ['dha', 'ధ'], ['pha', 'ఫ'], ['bha', 'భ'],
  ['sha', 'శ'],
  ['ka', 'క'], ['ga', 'గ'], ['ja', 'జ'], ['ta', 'ట'],
  ['da', 'డ'], ['na', 'న'], ['pa', 'ప'], ['ba', 'బ'],
  ['ma', 'మ'], ['ya', 'య'], ['ra', 'ర'], ['la', 'ల'],
  ['va', 'వ'], ['sa', 'స'], ['ha', 'హ'],
  ['aa', 'ఆ'], ['ai', 'ఐ'], ['au', 'ఔ'], ['ee', 'ఈ'],
  ['oo', 'ఊ'],
  ['a', 'అ'], ['i', 'ఇ'], ['u', 'ఉ'], ['e', 'ఎ'], ['o', 'ఒ'],
];

/**
 * Common romanized Hindi injection keywords mapped to their Devanagari equivalents.
 * Used for keyword-level matching when full transliteration isn't clean enough.
 */
export const HINDI_INJECTION_KEYWORDS: Record<string, string[]> = {
  ignore: ['andekha', 'nazarandaz', 'bhool ja', 'chod do', 'ignore kar'],
  instructions: ['nirdesh', 'aadesh', 'hukm', 'instructions', 'niyam'],
  system_prompt: ['system prompt', 'niyam', 'nirdesh patra'],
  reveal: ['batao', 'dikhao', 'prakat karo', 'bata do', 'dikha do'],
  unrestricted: ['bina rok', 'bina pabandi', 'swatantra', 'mukt'],
  override: ['badal do', 'replace karo', 'hata do', 'change karo'],
  forget: ['bhool ja', 'bhool jao', 'yaad mat rakh'],
  previous: ['pichle', 'pehle', 'purane', 'pahle ke'],
  all: ['sabhi', 'saare', 'sab', 'poore'],
  developer: ['developer', 'admin', 'malik', 'owner'],
};

export const TAMIL_INJECTION_KEYWORDS: Record<string, string[]> = {
  ignore: ['purakkanikavum', 'maranthu vidu', 'vittu vidu'],
  instructions: ['arivuraigal', 'vidhigal', 'nibandhanaigal'],
  reveal: ['kaattu', 'velippaduthu', 'sollu'],
  system_prompt: ['system prompt', 'amaippu nirdesh'],
  previous: ['munthaya', 'munnadi', 'mun'],
};

/**
 * Transliterate a romanized Indic string to native script.
 * This is a best-effort romanization reversal, not a production transliterator.
 * It handles the most common romanization conventions.
 */
export function transliterateToDevanagari(text: string): string {
  return applyTranslitMap(text.toLowerCase(), HINDI_TRANSLIT_MAP);
}

export function transliterateToTamil(text: string): string {
  return applyTranslitMap(text.toLowerCase(), TAMIL_TRANSLIT_MAP);
}

export function transliterateToTelugu(text: string): string {
  return applyTranslitMap(text.toLowerCase(), TELUGU_TRANSLIT_MAP);
}

function applyTranslitMap(text: string, map: [string, string][]): string {
  let result = '';
  let i = 0;
  while (i < text.length) {
    let matched = false;
    // Try longest match first (map is pre-sorted longest-first)
    for (const [latin, native] of map) {
      if (text.startsWith(latin, i)) {
        result += native;
        i += latin.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  return result;
}

/**
 * Detect script family of a text string.
 */
export function detectScript(text: string): 'latin' | 'devanagari' | 'tamil' | 'telugu' | 'bengali' | 'mixed' | 'unknown' {
  const devanagari = /[\u0900-\u097F]/;
  const tamil = /[\u0B80-\u0BFF]/;
  const telugu = /[\u0C00-\u0C7F]/;
  const bengali = /[\u0980-\u09FF]/;
  const latin = /[a-zA-Z]/;

  const scripts: string[] = [];
  if (devanagari.test(text)) scripts.push('devanagari');
  if (tamil.test(text)) scripts.push('tamil');
  if (telugu.test(text)) scripts.push('telugu');
  if (bengali.test(text)) scripts.push('bengali');
  if (latin.test(text)) scripts.push('latin');

  if (scripts.length === 0) return 'unknown';
  if (scripts.length > 1) return 'mixed';
  return scripts[0] as 'latin' | 'devanagari' | 'tamil' | 'telugu' | 'bengali';
}
