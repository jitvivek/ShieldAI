/**
 * Indian PII Scanner — detects Aadhaar, PAN, UPI ID, IFSC,
 * Indian phone numbers, passports, voter IDs, bank accounts,
 * email addresses, and credit cards.
 *
 * Includes Verhoeff checksum for Aadhaar and Luhn check for credit cards.
 * Returns DPDP Act section references for every detection.
 */

import type { PiiType, PiiMatch, PiiScanResult, PiiPatternConfig, PiiSeverity } from '../types/pii';

// --- Verhoeff checksum tables for Aadhaar validation ---
const VERHOEFF_D: number[][] = [
  [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],
  [2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],
  [4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],
  [8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0],
];
const VERHOEFF_P: number[][] = [
  [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],
  [5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],
  [9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8],
];
const VERHOEFF_INV = [0,4,3,2,1,5,6,7,8,9];

function verhoeffCheck(num: string): boolean {
  let c = 0;
  const digits = num.split('').reverse().map(Number);
  for (let i = 0; i < digits.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digits[i]]];
  }
  return c === 0;
}

function luhnCheck(num: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

// --- Valid UPI handles ---
const VALID_UPI_HANDLES = new Set([
  'upi', 'paytm', 'ybl', 'okhdfcbank', 'okicici', 'oksbi',
  'apl', 'axisbank', 'ibl', 'sbi', 'icici', 'hdfcbank',
  'kotak', 'indus', 'rbl', 'federal', 'boi', 'cbi',
  'pnb', 'cnrb', 'idbi', 'allbank', 'aubank', 'jupiteraxis',
  'freecharge', 'amazonpay', 'gpay', 'phonepe', 'slice',
]);

function maskValue(value: string, type: PiiType): string {
  switch (type) {
    case 'aadhaar': {
      const clean = value.replace(/[\s-]/g, '');
      return `XXXX-XXXX-${clean.slice(-4)}`;
    }
    case 'pan':
      return `${value.slice(0, 2)}XXX${value.slice(5, 7)}XX${value.slice(-1)}`;
    case 'credit_card': {
      const clean = value.replace(/[\s-]/g, '');
      return `XXXX-XXXX-XXXX-${clean.slice(-4)}`;
    }
    case 'indian_phone':
      return `XXXXXX${value.slice(-4)}`;
    case 'upi_id':
      return `${value.split('@')[0]?.slice(0, 2)}***@${value.split('@')[1]}`;
    case 'email': {
      const [local, domain] = value.split('@');
      return `${local?.slice(0, 2)}***@${domain}`;
    }
    default:
      return value.length > 4 ? 'X'.repeat(value.length - 4) + value.slice(-4) : 'XXXX';
  }
}

const PII_PATTERNS: Record<PiiType, PiiPatternConfig> = {
  aadhaar: {
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    validator: (match: string) => verhoeffCheck(match.replace(/[\s-]/g, '')),
    description: 'Aadhaar number (12-digit with Verhoeff checksum)',
    severity: 'critical',
    dpdpSection: 'Section 8(1) — Personal data processing',
  },
  pan: {
    pattern: /\b[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]\b/g,
    validator: (match: string) => 'ABCFGHLJPT'.includes(match[3]),
    description: 'PAN card number (ABCDE1234F format)',
    severity: 'critical',
    dpdpSection: 'Section 8(1) — Personal data processing',
  },
  upi_id: {
    pattern: /\b[a-zA-Z0-9._-]+@[a-zA-Z]{2,}\b/g,
    validator: (match: string) => {
      const handle = match.split('@')[1]?.toLowerCase();
      return handle ? VALID_UPI_HANDLES.has(handle) : false;
    },
    description: 'UPI ID (name@bankhandle)',
    severity: 'high',
    dpdpSection: 'Section 8(1) — Personal data processing',
  },
  ifsc: {
    pattern: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    description: 'IFSC code (SBIN0001234 format)',
    severity: 'medium',
    dpdpSection: 'Section 8(1) — Personal data processing',
  },
  indian_phone: {
    pattern: /(?:\+91[\s-]?|91[\s-]?|0)?[6-9]\d{9}\b/g,
    description: 'Indian mobile number',
    severity: 'high',
    dpdpSection: 'Section 8(1) — Personal data processing',
  },
  indian_passport: {
    pattern: /\b[A-PR-WY][1-9]\d{6}\b/g,
    description: 'Indian passport number',
    severity: 'critical',
    dpdpSection: 'Section 8(1) — Personal data processing',
  },
  voter_id_epic: {
    pattern: /\b[A-Z]{3}\d{7}\b/g,
    description: 'Voter ID / EPIC number',
    severity: 'high',
    dpdpSection: 'Section 8(1) — Personal data processing',
  },
  indian_bank_account: {
    pattern: /\b\d{9,18}\b/g,
    validator: (match: string) => match.length >= 9 && match.length <= 18,
    description: 'Indian bank account number (9-18 digits)',
    severity: 'critical',
    dpdpSection: 'Section 8(1) — Personal data processing',
  },
  email: {
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    description: 'Email address',
    severity: 'high',
    dpdpSection: 'Section 8(1) — Personal data processing',
  },
  credit_card: {
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    validator: (match: string) => luhnCheck(match.replace(/[\s-]/g, '')),
    description: 'Credit/debit card number (16-digit with Luhn check)',
    severity: 'critical',
    dpdpSection: 'Section 8(1) — Personal data processing',
  },
};

// Bank account detection needs co-occurrence with IFSC or bank name to reduce FPs
const BANK_CONTEXT_KEYWORDS = /\b(ifsc|bank|account|a\/c|neft|rtgs|imps|branch)\b/i;

/**
 * Scan text for Indian PII. Runs on both input and output.
 * Returns masked matches with DPDP section references.
 */
export function scanForPii(text: string): PiiScanResult {
  const start = performance.now();
  const matches: PiiMatch[] = [];
  const dpdpFlags = new Set<string>();

  // Normalize text for pattern matching (uppercase for PAN/IFSC)
  const upperText = text.toUpperCase();

  for (const [type, config] of Object.entries(PII_PATTERNS) as [PiiType, PiiPatternConfig][]) {
    const searchText = ['pan', 'ifsc', 'voter_id_epic', 'indian_passport'].includes(type)
      ? upperText
      : text;

    // Reset regex lastIndex
    config.pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = config.pattern.exec(searchText)) !== null) {
      const raw = match[0];

      // Bank account needs context to avoid FPs (bare 9-18 digit numbers are common)
      if (type === 'indian_bank_account' && !BANK_CONTEXT_KEYWORDS.test(text)) {
        continue;
      }

      // Avoid double-counting: Aadhaar (12 digits) vs credit card (16 digits)
      // If 16-digit, skip aadhaar match
      if (type === 'aadhaar' && raw.replace(/[\s-]/g, '').length !== 12) continue;

      const validated = config.validator ? config.validator(raw) : true;

      // Only include validated matches for patterns with validators
      if (config.validator && !validated) continue;

      matches.push({
        type,
        value: maskValue(raw, type),
        position: { start: match.index, end: match.index + raw.length },
        severity: config.severity,
        dpdpSection: config.dpdpSection,
        validated,
      });

      dpdpFlags.add(config.dpdpSection);
    }
  }

  return {
    piiFound: matches.length > 0,
    matches,
    dpdpFlags: [...dpdpFlags],
    processingTimeMs: Math.round(performance.now() - start),
  };
}
