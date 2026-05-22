import type { PiiMatch } from './types';

// Verhoeff algorithm for Aadhaar validation
const verhoeffD = [
  [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0],
];
const verhoeffP = [
  [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8],
];

function verhoeffCheck(num: string): boolean {
  const digits = num.replace(/[\s-]/g, '').split('').reverse().map(Number);
  let c = 0;
  for (let i = 0; i < digits.length; i++) {
    c = verhoeffD[c][verhoeffP[i % 8][digits[i]]];
  }
  return c === 0;
}

function luhnCheck(num: string): boolean {
  const digits = num.replace(/[\s-]/g, '').split('').reverse().map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

interface PiiPatternDef {
  pattern: RegExp;
  label: string;
  type: string;
  validator?: (match: string) => boolean;
}

const PII_PATTERNS: PiiPatternDef[] = [
  {
    type: 'aadhaar',
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    validator: verhoeffCheck,
    label: 'Aadhaar number',
  },
  {
    type: 'pan',
    pattern: /\b[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]\b/g,
    label: 'PAN card',
  },
  {
    type: 'upiId',
    pattern: /\b[a-zA-Z0-9._-]+@(upi|paytm|ybl|okhdfcbank|okicici|oksbi|apl|axisbank|ibl|sbi|icici|hdfcbank)\b/g,
    label: 'UPI ID',
  },
  {
    type: 'ifsc',
    pattern: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    label: 'IFSC code',
  },
  {
    type: 'indianPhone',
    pattern: /(?:\+91|91|0)?[6-9]\d{9}\b/g,
    label: 'Phone number',
  },
  {
    type: 'email',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    label: 'Email',
  },
  {
    type: 'creditCard',
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    validator: luhnCheck,
    label: 'Credit card',
  },
];

function maskValue(value: string, type: string): string {
  const clean = value.replace(/[\s-]/g, '');
  if (type === 'aadhaar') return `XXXX-XXXX-${clean.slice(-4)}`;
  if (type === 'pan') return `${clean.slice(0, 2)}XXX${clean.slice(5)}`;
  if (type === 'creditCard') return `XXXX-XXXX-XXXX-${clean.slice(-4)}`;
  if (type === 'indianPhone') return `XXXXX${clean.slice(-5)}`;
  if (type === 'email') {
    const [local, domain] = value.split('@');
    return `${local[0]}***@${domain}`;
  }
  return 'XXXX';
}

export function scanForPii(text: string): PiiMatch[] {
  const matches: PiiMatch[] = [];

  for (const def of PII_PATTERNS) {
    const regex = new RegExp(def.pattern.source, def.pattern.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const value = match[0];

      if (def.validator && !def.validator(value)) continue;

      // Skip UPI patterns that look like regular emails
      if (def.type === 'upiId' && !/@(upi|paytm|ybl|okhdfcbank|okicici|oksbi|apl|axisbank|ibl|sbi|icici|hdfcbank)$/i.test(value)) continue;

      matches.push({
        type: def.type,
        label: def.label,
        masked: maskValue(value, def.type),
        startIndex: match.index,
        endIndex: match.index + value.length,
      });
    }
  }

  return matches;
}

export { PII_PATTERNS };
