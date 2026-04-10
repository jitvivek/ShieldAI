/**
 * Leetspeak normalization map and converter.
 * Converts common leetspeak substitutions back to standard characters.
 */

// Multi-character substitutions (must be checked first, longest match)
const MULTI_CHAR_MAP: Array<[string, string]> = [
  ['/\\/\\', 'm'],
  ['|\\/|', 'm'],
  ['/\\/', 'n'],
  ['|\\|', 'n'],
  ['\\/\\/', 'w'],
  ['|_|', 'u'],
  ['|-|', 'h'],
  ['|_', 'l'],
  ['|2', 'r'],
  ['()', 'o'],
  ['\\/', 'v'],
  ['/\\', 'a'],
  ['ph', 'f'],
  ['}{', 'h'],
  ['|<', 'k'],
  ['][', 'i'],
  ['|-', 'f'],
  ['|=', 'f'],
  ['[]', 'd'],
  ['>:', 'd'],
];

// Single-character substitutions
const SINGLE_CHAR_MAP: Record<string, string> = {
  '1': 'i',
  '!': 'i',
  '|': 'l',
  '3': 'e',
  '4': 'a',
  '@': 'a',
  '5': 's',
  $: 's',
  '7': 't',
  '0': 'o',
  '8': 'b',
  '9': 'g',
  '6': 'g',
  '+': 't',
  '2': 'z',
};

/**
 * Convert leetspeak text back to standard English characters.
 * Processes multi-character substitutions first (longest match wins),
 * then single character substitutions.
 */
export function deLeetspeak(input: string): string {
  let result = input.toLowerCase();

  // Apply multi-character substitutions first
  for (const [leet, normal] of MULTI_CHAR_MAP) {
    // Escape special regex characters in the leet pattern
    const escaped = leet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'gi'), normal);
  }

  // Apply single-character substitutions
  let output = '';
  for (const char of result) {
    output += SINGLE_CHAR_MAP[char] ?? char;
  }

  return output;
}

/**
 * Check if text contains significant leetspeak content.
 * Returns a ratio of characters that match leetspeak patterns.
 */
export function getLeetSpeakRatio(input: string): number {
  if (input.length === 0) return 0;

  const leetChars = Object.keys(SINGLE_CHAR_MAP);
  let leetCount = 0;

  for (const char of input) {
    if (leetChars.includes(char)) {
      leetCount++;
    }
  }

  return leetCount / input.length;
}
