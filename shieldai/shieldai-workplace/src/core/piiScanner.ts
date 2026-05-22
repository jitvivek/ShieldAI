import { createHash } from 'crypto';
import pino from 'pino';
import type { PiiMatch } from '../types/common';

const logger = pino({ name: 'pii-scanner' });

interface PiiPattern {
  type: string;
  pattern: RegExp;
  label: string;
  validator?: (value: string) => boolean;
}

// Verhoeff algorithm for Aadhaar validation
const verhoeffTable = {
  d: [
    [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
    [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
    [9,8,7,6,5,4,3,2,1,0],
  ],
  p: [
    [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
    [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
    [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8],
  ],
  inv: [0,4,3,2,1,5,6,7,8,9],
};

function verhoeffCheck(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  let c = 0;
  const len = digits.length;
  for (let i = 0; i < len; i++) {
    const digit = parseInt(digits[len - 1 - i]!, 10);
    const pIdx = i % 8;
    c = verhoeffTable.d[c]![verhoeffTable.p[pIdx]![digit]!]!;
  }
  return c === 0;
}

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i]!, 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

const PII_PATTERNS: PiiPattern[] = [
  {
    type: 'aadhaar',
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    label: 'Aadhaar number',
    validator: (v) => verhoeffCheck(v.replace(/\D/g, '')),
  },
  {
    type: 'pan',
    pattern: /\b[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]\b/g,
    label: 'PAN card',
  },
  {
    type: 'upi_id',
    pattern: /\b[a-zA-Z0-9._-]+@(upi|paytm|ybl|okhdfcbank|okicici|oksbi|apl|axisbank|ibl|sbi|icici|hdfcbank)\b/g,
    label: 'UPI ID',
  },
  {
    type: 'ifsc',
    pattern: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    label: 'IFSC code',
  },
  {
    type: 'phone',
    pattern: /(?:\+91|91|0)?[6-9]\d{9}\b/g,
    label: 'Phone number',
  },
  {
    type: 'email',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    label: 'Email address',
  },
  {
    type: 'credit_card',
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    label: 'Credit card number',
    validator: (v) => luhnCheck(v.replace(/\D/g, '')),
  },
];

function maskValue(value: string, type: string): string {
  const clean = value.replace(/\s/g, '');
  if (clean.length <= 4) return '****';
  return '*'.repeat(clean.length - 4) + clean.slice(-4);
}

export function scanForPii(text: string): PiiMatch[] {
  const matches: PiiMatch[] = [];
  const upperText = text.toUpperCase();

  for (const piiDef of PII_PATTERNS) {
    const regex = new RegExp(piiDef.pattern.source, piiDef.pattern.flags);
    const searchText = piiDef.type === 'pan' || piiDef.type === 'ifsc' ? upperText : text;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(searchText)) !== null) {
      const value = match[0];
      if (piiDef.validator && !piiDef.validator(value)) continue;

      matches.push({
        type: piiDef.type,
        value,
        masked: maskValue(value, piiDef.type),
        position: { start: match.index, end: match.index + value.length },
      });
    }
  }

  return matches;
}

export function hashUserId(userId: string): string {
  return createHash('sha256').update(userId).digest('hex').slice(0, 16);
}
