/**
 * Unicode normalization, homoglyph detection, and invisible character handling.
 * Implements NFKC normalization and a comprehensive confusables map.
 */

/**
 * Zero-width and invisible characters to strip.
 */
const INVISIBLE_CODEPOINTS: number[] = [
  0x200b, // Zero-width space
  0x200c, // Zero-width non-joiner
  0x200d, // Zero-width joiner
  0x200e, // Left-to-right mark
  0x200f, // Right-to-left mark
  0x00ad, // Soft hyphen
  0xfeff, // BOM / Zero-width no-break space
  0x2060, // Word joiner
  0x2061, // Function application
  0x2062, // Invisible times
  0x2063, // Invisible separator
  0x2064, // Invisible plus
  0x2066, // Left-to-right isolate
  0x2067, // Right-to-left isolate
  0x2068, // First strong isolate
  0x2069, // Pop directional isolate
  0x202a, // Left-to-right embedding
  0x202b, // Right-to-left embedding
  0x202c, // Pop directional formatting
  0x202d, // Left-to-right override
  0x202e, // Right-to-left override
  0x034f, // Combining grapheme joiner
  0x061c, // Arabic letter mark
  0x115f, // Hangul choseong filler
  0x1160, // Hangul jungseong filler
  0x17b4, // Khmer vowel inherent AQ
  0x17b5, // Khmer vowel inherent AA
  0x180e, // Mongolian vowel separator
];

const INVISIBLE_SET = new Set(INVISIBLE_CODEPOINTS);

/**
 * Comprehensive confusables map: maps visually similar Unicode characters to ASCII equivalents.
 * Covers Cyrillic→Latin, fullwidth→ASCII, mathematical→ASCII, and other homoglyphs.
 */
const CONFUSABLES_MAP: Record<string, string> = {
  // Cyrillic → Latin
  '\u0410': 'A', // А
  '\u0430': 'a', // а
  '\u0412': 'B', // В
  '\u0432': 'b', // в — sometimes 'v' in Russian but visually similar to 'b' in some fonts
  '\u0421': 'C', // С
  '\u0441': 'c', // с
  '\u0415': 'E', // Е
  '\u0435': 'e', // е
  '\u041d': 'H', // Н
  '\u043d': 'h', // н
  '\u0406': 'I', // І (Ukrainian)
  '\u0456': 'i', // і
  '\u0408': 'J', // Ј (Serbian)
  '\u0458': 'j', // ј
  '\u041a': 'K', // К
  '\u043a': 'k', // к
  '\u041c': 'M', // М
  '\u043c': 'm', // м
  '\u041e': 'O', // О
  '\u043e': 'o', // о
  '\u0420': 'P', // Р
  '\u0440': 'p', // р
  '\u0405': 'S', // Ѕ (Macedonian)
  '\u0455': 's', // ѕ
  '\u0422': 'T', // Т
  '\u0442': 't', // т
  '\u0425': 'X', // Х
  '\u0445': 'x', // х
  '\u0423': 'Y', // У
  '\u0443': 'y', // у
  '\u0417': 'Z', // З — actually looks like '3' but is in Cyrillic
  // Additional Cyrillic
  '\u0404': 'E', // Є (Ukrainian)
  '\u0454': 'e', // є
  '\u0407': 'I', // Ї (Ukrainian)
  '\u0457': 'i', // ї
  '\u040e': 'Y', // Ў (Belarusian)
  '\u045e': 'y', // ў
  '\u0462': 'E', // Ѣ (yat)
  '\u0472': 'F', // Ѳ (fita)
  '\u0473': 'f', // ѳ

  // Greek → Latin
  '\u0391': 'A', // Α
  '\u03b1': 'a', // α
  '\u0392': 'B', // Β
  '\u03b2': 'b', // β
  '\u0395': 'E', // Ε
  '\u03b5': 'e', // ε
  '\u0397': 'H', // Η
  '\u03b7': 'h', // η
  '\u0399': 'I', // Ι
  '\u03b9': 'i', // ι
  '\u039a': 'K', // Κ
  '\u03ba': 'k', // κ
  '\u039c': 'M', // Μ
  '\u039d': 'N', // Ν
  '\u039f': 'O', // Ο
  '\u03bf': 'o', // ο
  '\u03a1': 'P', // Ρ
  '\u03c1': 'p', // ρ
  '\u03a4': 'T', // Τ
  '\u03c4': 't', // τ
  '\u03a5': 'Y', // Υ
  '\u03c5': 'y', // υ
  '\u03a7': 'X', // Χ
  '\u03c7': 'x', // χ
  '\u0396': 'Z', // Ζ
  '\u03b6': 'z', // ζ

  // Fullwidth → ASCII
  '\uff21': 'A',
  '\uff22': 'B',
  '\uff23': 'C',
  '\uff24': 'D',
  '\uff25': 'E',
  '\uff26': 'F',
  '\uff27': 'G',
  '\uff28': 'H',
  '\uff29': 'I',
  '\uff2a': 'J',
  '\uff2b': 'K',
  '\uff2c': 'L',
  '\uff2d': 'M',
  '\uff2e': 'N',
  '\uff2f': 'O',
  '\uff30': 'P',
  '\uff31': 'Q',
  '\uff32': 'R',
  '\uff33': 'S',
  '\uff34': 'T',
  '\uff35': 'U',
  '\uff36': 'V',
  '\uff37': 'W',
  '\uff38': 'X',
  '\uff39': 'Y',
  '\uff3a': 'Z',
  '\uff41': 'a',
  '\uff42': 'b',
  '\uff43': 'c',
  '\uff44': 'd',
  '\uff45': 'e',
  '\uff46': 'f',
  '\uff47': 'g',
  '\uff48': 'h',
  '\uff49': 'i',
  '\uff4a': 'j',
  '\uff4b': 'k',
  '\uff4c': 'l',
  '\uff4d': 'm',
  '\uff4e': 'n',
  '\uff4f': 'o',
  '\uff50': 'p',
  '\uff51': 'q',
  '\uff52': 'r',
  '\uff53': 's',
  '\uff54': 't',
  '\uff55': 'u',
  '\uff56': 'v',
  '\uff57': 'w',
  '\uff58': 'x',
  '\uff59': 'y',
  '\uff5a': 'z',
  '\uff10': '0',
  '\uff11': '1',
  '\uff12': '2',
  '\uff13': '3',
  '\uff14': '4',
  '\uff15': '5',
  '\uff16': '6',
  '\uff17': '7',
  '\uff18': '8',
  '\uff19': '9',

  // Mathematical italic/bold → ASCII
  '\ud835\udc00': 'A', // 𝐀
  '\ud835\udc01': 'B',
  '\ud835\udc02': 'C',
  '\ud835\udc03': 'D',
  '\ud835\udc04': 'E',
  '\ud835\udc05': 'F',
  '\ud835\udc06': 'G',
  '\ud835\udc07': 'H',
  '\ud835\udc08': 'I',
  '\ud835\udc09': 'J',
  '\ud835\udc0a': 'K',
  '\ud835\udc0b': 'L',
  '\ud835\udc0c': 'M',
  '\ud835\udc0d': 'N',
  '\ud835\udc0e': 'O',
  '\ud835\udc0f': 'P',
  '\ud835\udc10': 'Q',
  '\ud835\udc11': 'R',
  '\ud835\udc12': 'S',
  '\ud835\udc13': 'T',
  '\ud835\udc14': 'U',
  '\ud835\udc15': 'V',
  '\ud835\udc16': 'W',
  '\ud835\udc17': 'X',
  '\ud835\udc18': 'Y',
  '\ud835\udc19': 'Z',
  '\ud835\udc1a': 'a',
  '\ud835\udc1b': 'b',
  '\ud835\udc1c': 'c',
  '\ud835\udc1d': 'd',
  '\ud835\udc1e': 'e',
  '\ud835\udc1f': 'f',
  '\ud835\udc20': 'g',
  '\ud835\udc21': 'h',
  '\ud835\udc22': 'i',
  '\ud835\udc23': 'j',
  '\ud835\udc24': 'k',
  '\ud835\udc25': 'l',
  '\ud835\udc26': 'm',
  '\ud835\udc27': 'n',
  '\ud835\udc28': 'o',
  '\ud835\udc29': 'p',
  '\ud835\udc2a': 'q',
  '\ud835\udc2b': 'r',
  '\ud835\udc2c': 's',
  '\ud835\udc2d': 't',
  '\ud835\udc2e': 'u',
  '\ud835\udc2f': 'v',
  '\ud835\udc30': 'w',
  '\ud835\udc31': 'x',
  '\ud835\udc32': 'y',
  '\ud835\udc33': 'z',

  // Other common confusables
  '\u00c0': 'A', // À
  '\u00c1': 'A', // Á
  '\u00c2': 'A', // Â
  '\u00c3': 'A', // Ã
  '\u00c4': 'A', // Ä
  '\u00c5': 'A', // Å
  '\u00c8': 'E', // È
  '\u00c9': 'E', // É
  '\u00ca': 'E', // Ê
  '\u00cb': 'E', // Ë
  '\u00cc': 'I', // Ì
  '\u00cd': 'I', // Í
  '\u00ce': 'I', // Î
  '\u00cf': 'I', // Ï
  '\u00d2': 'O', // Ò
  '\u00d3': 'O', // Ó
  '\u00d4': 'O', // Ô
  '\u00d5': 'O', // Õ
  '\u00d6': 'O', // Ö
  '\u00d9': 'U', // Ù
  '\u00da': 'U', // Ú
  '\u00db': 'U', // Û
  '\u00dc': 'U', // Ü
  '\u00e0': 'a', // à
  '\u00e1': 'a', // á
  '\u00e2': 'a', // â
  '\u00e3': 'a', // ã
  '\u00e4': 'a', // ä
  '\u00e5': 'a', // å
  '\u00e8': 'e', // è
  '\u00e9': 'e', // é
  '\u00ea': 'e', // ê
  '\u00eb': 'e', // ë
  '\u00ec': 'i', // ì
  '\u00ed': 'i', // í
  '\u00ee': 'i', // î
  '\u00ef': 'i', // ï
  '\u00f2': 'o', // ò
  '\u00f3': 'o', // ó
  '\u00f4': 'o', // ô
  '\u00f5': 'o', // õ
  '\u00f6': 'o', // ö
  '\u00f9': 'u', // ù
  '\u00fa': 'u', // ú
  '\u00fb': 'u', // û
  '\u00fc': 'u', // ü
  '\u0131': 'i', // ı (dotless i)
  '\u0130': 'I', // İ (dotted I)
  '\u017f': 's', // ſ (long s)
  '\u0261': 'g', // ɡ (script g)
  '\u1d00': 'A', // ᴀ (small capital A)
  '\u1d04': 'C', // ᴄ
  '\u1d05': 'D', // ᴅ
  '\u1d07': 'E', // ᴇ
  '\u029c': 'H', // ʜ
  '\u1d0a': 'J', // ᴊ
  '\u1d0b': 'K', // ᴋ
  '\u029f': 'L', // ʟ
  '\u1d0d': 'M', // ᴍ
  '\u0274': 'N', // ɴ
  '\u1d0f': 'O', // ᴏ
  '\u1d18': 'P', // ᴘ
  '\u0280': 'R', // ʀ
  '\u1d1b': 'T', // ᴛ
  '\u1d1c': 'U', // ᴜ
  '\u1d20': 'V', // ᴠ
  '\u1d21': 'W', // ᴡ
};

/**
 * Apply NFKC normalization and replace homoglyph characters.
 * Returns the normalized text and count of homoglyphs found.
 */
export function normalizeUnicode(text: string): { normalized: string; homoglyphsFound: number } {
  // Step 1: NFKC normalization (handles fullwidth, compatibility chars, etc.)
  let result = text.normalize('NFKC');

  // Step 2: Replace confusable characters using our map
  let homoglyphsFound = 0;
  let output = '';

  for (const char of result) {
    const replacement = CONFUSABLES_MAP[char];
    if (replacement) {
      output += replacement;
      homoglyphsFound++;
    } else {
      output += char;
    }
  }

  return { normalized: output, homoglyphsFound };
}

/**
 * Remove invisible and zero-width characters from text.
 * Returns the cleaned text and count of removed characters.
 */
export function stripInvisibleChars(text: string): { cleaned: string; removedCount: number } {
  let removedCount = 0;
  let result = '';

  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (codePoint !== undefined && INVISIBLE_SET.has(codePoint)) {
      removedCount++;
    } else if (codePoint !== undefined && isUnicodeCategoryControl(codePoint)) {
      removedCount++;
    } else {
      result += char;
    }
  }

  return { cleaned: result, removedCount };
}

/**
 * Check if a codepoint belongs to Unicode General Category Cf (format characters).
 * This supplements the explicit invisible codepoints list.
 */
function isUnicodeCategoryControl(codePoint: number): boolean {
  // Range-based detection for common Cf characters not already in our set
  if (codePoint >= 0xfff9 && codePoint <= 0xfffb) return true; // Interlinear annotations
  if (codePoint >= 0x1bca0 && codePoint <= 0x1bca3) return true; // Shorthand format controls
  if (codePoint === 0x110bd || codePoint === 0x110cd) return true; // Kaithi number signs
  return false;
}

/**
 * Normalize whitespace: collapse multiple spaces, trim, remove invisible formatting.
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}
