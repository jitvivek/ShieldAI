/**
 * Encoding detection and decoding utilities.
 * Supports Base64, hex, ROT13, URL encoding, HTML entities, and binary ASCII.
 * Recursive decoding up to depth 3.
 */

const BASE64_REGEX = /^[A-Za-z0-9+/]{16,}={0,2}$/;
const HEX_ESCAPE_REGEX = /\\x([0-9A-Fa-f]{2})/g;
const URL_ENCODED_REGEX = /%([0-9A-Fa-f]{2})/g;
const HTML_HEX_ENTITY_REGEX = /&#x([0-9A-Fa-f]+);/gi;
const HTML_DEC_ENTITY_REGEX = /&#(\d+);/g;
const BINARY_ASCII_REGEX = /^([01]{8}\s+)*[01]{8}$/;

const HTML_NAMED_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': ' ',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&hellip;': '…',
  '&mdash;': '—',
  '&ndash;': '–',
  '&laquo;': '«',
  '&raquo;': '»',
};

interface DecodingResult {
  decoded: string;
  encodingsFound: string[];
}

/**
 * Attempt to detect and decode Base64 content.
 */
function tryDecodeBase64(text: string): string | null {
  const stripped = text.replace(/\s+/g, '');
  if (!BASE64_REGEX.test(stripped)) return null;

  try {
    const decoded = Buffer.from(stripped, 'base64').toString('utf-8');
    // Verify the decoded text is valid UTF-8 with mostly printable chars
    const printableRatio =
      decoded.split('').filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127).length /
      decoded.length;
    if (printableRatio > 0.7 && decoded.length > 2) {
      return decoded;
    }
  } catch {
    // Not valid Base64
  }
  return null;
}

/**
 * Decode hex escape sequences like \x48\x65\x6c\x6c\x6f → Hello
 */
function decodeHexEscapes(text: string): { decoded: string; found: boolean } {
  let found = false;
  const decoded = text.replace(HEX_ESCAPE_REGEX, (_, hex: string) => {
    found = true;
    return String.fromCharCode(parseInt(hex, 16));
  });
  return { decoded, found };
}

/**
 * Apply ROT13 transformation.
 */
function applyRot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

/**
 * Simple heuristic to determine if text might be ROT13-encoded.
 * Checks if the decoded version contains more common English words.
 */
function mightBeRot13(text: string): boolean {
  const commonWords = [
    'the',
    'and',
    'for',
    'are',
    'but',
    'not',
    'you',
    'all',
    'can',
    'had',
    'her',
    'was',
    'one',
    'our',
    'out',
    'ignore',
    'system',
    'prompt',
    'instruction',
    'override',
  ];

  const decoded = applyRot13(text.toLowerCase());
  const words = decoded.split(/\s+/);
  const matchCount = words.filter((w) => commonWords.includes(w)).length;
  const originalMatch = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => commonWords.includes(w)).length;

  return matchCount > originalMatch && matchCount >= 2;
}

/**
 * Decode URL-encoded sequences (%XX).
 */
function decodeUrlEncoding(text: string): { decoded: string; found: boolean } {
  let found = false;
  const decoded = text.replace(URL_ENCODED_REGEX, (_, hex: string) => {
    found = true;
    return String.fromCharCode(parseInt(hex, 16));
  });
  return { decoded, found };
}

/**
 * Decode HTML entities (hex, decimal, and named).
 */
function decodeHtmlEntities(text: string): { decoded: string; found: boolean } {
  let found = false;
  let decoded = text;

  // Hex entities: &#xNNNN;
  decoded = decoded.replace(HTML_HEX_ENTITY_REGEX, (_, hex: string) => {
    found = true;
    return String.fromCharCode(parseInt(hex, 16));
  });

  // Decimal entities: &#NNNN;
  decoded = decoded.replace(HTML_DEC_ENTITY_REGEX, (_, dec: string) => {
    found = true;
    return String.fromCharCode(parseInt(dec, 10));
  });

  // Named entities
  for (const [entity, char] of Object.entries(HTML_NAMED_ENTITIES)) {
    if (decoded.includes(entity)) {
      found = true;
      decoded = decoded.split(entity).join(char);
    }
  }

  return { decoded, found };
}

/**
 * Decode binary ASCII: "01001000 01100101 01101100 01101100 01101111" → "Hello"
 */
function decodeBinaryAscii(text: string): string | null {
  const trimmed = text.trim();
  if (!BINARY_ASCII_REGEX.test(trimmed)) return null;

  try {
    const bytes = trimmed.split(/\s+/);
    const decoded = bytes.map((b) => String.fromCharCode(parseInt(b, 2))).join('');
    const printableRatio =
      decoded.split('').filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127).length /
      decoded.length;
    if (printableRatio > 0.7) return decoded;
  } catch {
    // Not valid binary
  }
  return null;
}

/**
 * Recursively decode all detected encodings, up to maxDepth levels.
 */
export function decodeAllEncodings(text: string, maxDepth: number = 3): DecodingResult {
  const encodingsFound: string[] = [];

  let current = text;

  for (let depth = 0; depth < maxDepth; depth++) {
    let changed = false;

    // Try Base64 decode on the whole text or segments
    const base64Decoded = tryDecodeBase64(current);
    if (base64Decoded) {
      current = base64Decoded;
      encodingsFound.push('base64');
      changed = true;
      continue; // Start a new iteration to check if the decoded output is also encoded
    }

    // Try hex escapes
    const hexResult = decodeHexEscapes(current);
    if (hexResult.found) {
      current = hexResult.decoded;
      encodingsFound.push('hex');
      changed = true;
    }

    // Try URL encoding
    const urlResult = decodeUrlEncoding(current);
    if (urlResult.found) {
      current = urlResult.decoded;
      encodingsFound.push('url_encoding');
      changed = true;
    }

    // Try HTML entities
    const htmlResult = decodeHtmlEntities(current);
    if (htmlResult.found) {
      current = htmlResult.decoded;
      encodingsFound.push('html_entities');
      changed = true;
    }

    // Try binary ASCII
    const binaryDecoded = decodeBinaryAscii(current);
    if (binaryDecoded) {
      current = binaryDecoded;
      encodingsFound.push('binary_ascii');
      changed = true;
    }

    // Try ROT13 (only on first pass if text looks like it might be encoded)
    if (depth === 0 && mightBeRot13(current)) {
      current = applyRot13(current);
      encodingsFound.push('rot13');
      changed = true;
    }

    if (!changed) break;
  }

  return {
    decoded: current,
    encodingsFound: [...new Set(encodingsFound)],
  };
}

/**
 * Scan text for Base64-encoded segments within larger text.
 * Returns decoded text with encoded segments replaced by their decoded versions.
 */
export function decodeEmbeddedBase64(text: string): { decoded: string; found: boolean } {
  // Match potential Base64 segments (at least 16 chars, word-boundary delimited)
  const segmentRegex = /\b([A-Za-z0-9+/]{16,}={0,2})\b/g;
  let found = false;
  const decoded = text.replace(segmentRegex, (match) => {
    const result = tryDecodeBase64(match);
    if (result) {
      found = true;
      return result;
    }
    return match;
  });
  return { decoded, found };
}
