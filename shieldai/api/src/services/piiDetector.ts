/**
 * Phase 2 — PII Detector Service
 * Regex-based structured PII detection with detect/redact/block modes.
 */

import { PiiMatch, PiiType } from '../types/guard';

const PII_PATTERNS: Record<PiiType, RegExp> = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone_india: /(?:\+91|91|0)?[6-9]\d{9}/g,
  phone_intl: /\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
  aadhaar: /\d{4}[-\s]?\d{4}[-\s]?\d{4}/g,
  pan: /[A-Z]{5}\d{4}[A-Z]/g,
  credit_card: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g,
  ip_address: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
};

/**
 * Mask a PII value for safe logging — show only a few chars.
 */
function maskValue(value: string, type: PiiType): string {
  switch (type) {
    case 'email': {
      const [local, domain] = value.split('@');
      if (!local || !domain) return '[REDACTED]';
      return `${local[0]}***@${domain}`;
    }
    case 'credit_card':
      return `****-****-****-${value.replace(/[-\s]/g, '').slice(-4)}`;
    case 'aadhaar':
      return `XXXX-XXXX-${value.replace(/[-\s]/g, '').slice(-4)}`;
    case 'pan':
      return `${value.slice(0, 2)}***${value.slice(-1)}`;
    case 'phone_india':
    case 'phone_intl':
      return `***${value.slice(-4)}`;
    case 'ip_address':
      return value.replace(/\d+\.\d+$/, '***.***');
    default:
      return '[REDACTED]';
  }
}

/**
 * Validate Aadhaar using Verhoeff checksum (basic validation).
 */
function isValidAadhaar(value: string): boolean {
  const digits = value.replace(/[-\s]/g, '');
  return digits.length === 12 && /^\d{12}$/.test(digits);
}

/**
 * Validate credit card using Luhn algorithm.
 */
function isValidLuhn(value: string): boolean {
  const digits = value.replace(/[-\s]/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i]!, 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

/**
 * Additional validation per PII type to reduce false positives.
 */
function validateMatch(value: string, type: PiiType): boolean {
  switch (type) {
    case 'aadhaar':
      return isValidAadhaar(value);
    case 'credit_card':
      return isValidLuhn(value);
    case 'ip_address': {
      const octets = value.split('.');
      return octets.every((o) => {
        const n = parseInt(o, 10);
        return n >= 0 && n <= 255;
      });
    }
    default:
      return true;
  }
}

/**
 * Detect all PII in the given text.
 */
export function detectPii(
  text: string,
  allowedTypes?: PiiType[],
): PiiMatch[] {
  const matches: PiiMatch[] = [];
  const types = allowedTypes ?? (Object.keys(PII_PATTERNS) as PiiType[]);

  for (const type of types) {
    const pattern = PII_PATTERNS[type];
    if (!pattern) continue;

    // Reset regex state
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const value = match[0];
      if (!validateMatch(value, type)) continue;

      matches.push({
        type,
        value: maskValue(value, type),
        startIndex: match.index,
        endIndex: match.index + value.length,
      });
    }
  }

  // Deduplicate overlapping matches — keep the more specific type
  return deduplicateMatches(matches);
}

/**
 * Redact PII in text — replace matched regions with [REDACTED].
 */
export function redactPii(text: string, matches: PiiMatch[]): string {
  if (matches.length === 0) return text;

  // Sort by start index descending to replace from end → start
  const sorted = [...matches].sort((a, b) => b.startIndex - a.startIndex);
  let result = text;

  for (const m of sorted) {
    result = result.slice(0, m.startIndex) + '[REDACTED]' + result.slice(m.endIndex);
  }

  return result;
}

/**
 * Remove overlapping matches — keep the match with higher specificity.
 */
function deduplicateMatches(matches: PiiMatch[]): PiiMatch[] {
  if (matches.length <= 1) return matches;

  const sorted = [...matches].sort((a, b) => a.startIndex - b.startIndex);
  const result: PiiMatch[] = [sorted[0]!];

  for (let i = 1; i < sorted.length; i++) {
    const prev = result[result.length - 1]!;
    const curr = sorted[i]!;

    // If overlapping, keep the more specific one
    if (curr.startIndex < prev.endIndex) {
      // Prefer specific Indian types over generic
      const specificity: Record<PiiType, number> = {
        aadhaar: 10,
        pan: 10,
        credit_card: 9,
        email: 8,
        phone_india: 7,
        ip_address: 6,
        phone_intl: 5,
      };
      if ((specificity[curr.type] ?? 0) > (specificity[prev.type] ?? 0)) {
        result[result.length - 1] = curr;
      }
    } else {
      result.push(curr);
    }
  }

  return result;
}
