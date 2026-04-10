/**
 * Acrostic Decoder — Extracts hidden messages from acrostic patterns.
 * Detects when the first letter of each word or line spells out a
 * hidden keyword, commonly used to smuggle harmful terms past filters.
 */

/**
 * Dangerous keywords that, if found via acrostic extraction, indicate risk.
 * Kept lowercase for comparison.
 */
const DANGEROUS_KEYWORDS = new Set([
  'bomb', 'kill', 'harm', 'hack', 'drug', 'meth', 'die', 'gun',
  'rape', 'stab', 'shoot', 'knife', 'poison', 'ricin', 'sarin',
  'anthrax', 'cyanide', 'explosive', 'weapon', 'murder', 'attack',
  'terror', 'suicide', 'cocaine', 'heroin', 'fentanyl',
]);

export interface AcrosticResult {
  /** Whether an acrostic pattern containing a dangerous keyword was detected */
  detected: boolean;
  /** The extracted keyword, if any */
  extractedWord: string | null;
  /** Which method detected it */
  method: 'first_letter_words' | 'first_letter_lines' | 'capitalized_letters' | null;
}

/**
 * Extract first letters of each word and check against dangerous keywords.
 */
function checkFirstLettersOfWords(text: string): AcrosticResult {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 2) return { detected: false, extractedWord: null, method: null };

  const firstLetters = words.map((w) => w[0]!.toLowerCase()).join('');

  for (const keyword of DANGEROUS_KEYWORDS) {
    if (firstLetters.includes(keyword)) {
      return { detected: true, extractedWord: keyword, method: 'first_letter_words' };
    }
  }

  return { detected: false, extractedWord: null, method: null };
}

/**
 * Extract first letters of each line and check against dangerous keywords.
 */
function checkFirstLettersOfLines(text: string): AcrosticResult {
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { detected: false, extractedWord: null, method: null };

  const firstLetters = lines.map((l) => l.trim()[0]!.toLowerCase()).join('');

  for (const keyword of DANGEROUS_KEYWORDS) {
    if (firstLetters.includes(keyword)) {
      return { detected: true, extractedWord: keyword, method: 'first_letter_lines' };
    }
  }

  return { detected: false, extractedWord: null, method: null };
}

/**
 * Extract only the capitalized/uppercase letters from the text and check
 * for dangerous keywords. This catches patterns like "BomB" where the
 * capitals spell out something.
 */
function checkCapitalizedLetters(text: string): AcrosticResult {
  const capitals = text.replace(/[^A-Z]/g, '').toLowerCase();
  if (capitals.length < 2) return { detected: false, extractedWord: null, method: null };

  for (const keyword of DANGEROUS_KEYWORDS) {
    if (capitals.includes(keyword)) {
      return { detected: true, extractedWord: keyword, method: 'capitalized_letters' };
    }
  }

  return { detected: false, extractedWord: null, method: null };
}

/**
 * Detect whether the input contains an explicit instruction to read
 * first letters/characters, which signals an acrostic attack.
 */
function hasAcrosticInstruction(text: string): boolean {
  const patterns = [
    /read\s+(the\s+)?first\s+(letter|character|char|later)/i,
    /take\s+(the\s+)?first\s+(letter|character)/i,
    /first\s+(letter|character)\s+of\s+each/i,
    /extract\s+(the\s+)?(first|initial)\s+(letter|character)/i,
    /look\s+at\s+(the\s+)?(first|capital|uppercase)\s+(letter|character)/i,
    /first\s+later/i, // Common typo for "first letter"
  ];
  return patterns.some((p) => p.test(text));
}

/**
 * Run full acrostic detection on input text.
 * Checks multiple extraction methods and returns the first match.
 */
export function detectAcrostic(text: string): AcrosticResult {
  // If there's an explicit acrostic instruction, run all checks
  const hasInstruction = hasAcrosticInstruction(text);

  // Always check capitalized letters (catches "BomB" style)
  const capitalResult = checkCapitalizedLetters(text);
  if (capitalResult.detected) return capitalResult;

  // Check first letters of words
  const wordResult = checkFirstLettersOfWords(text);
  if (wordResult.detected) return wordResult;

  // Check first letters of lines (only if multi-line or instruction present)
  if (hasInstruction || text.includes('\n')) {
    const lineResult = checkFirstLettersOfLines(text);
    if (lineResult.detected) return lineResult;
  }

  return { detected: false, extractedWord: null, method: null };
}
