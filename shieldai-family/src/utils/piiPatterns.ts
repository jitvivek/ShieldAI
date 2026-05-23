// Verhoeff algorithm for Aadhaar validation
const d = [
  [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0],
];
const p = [
  [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8],
];

export function verhoeffCheck(num: string): boolean {
  const digits = num.replace(/[\s-]/g, '');
  if (digits.length !== 12) return false;
  let c = 0;
  const arr = digits.split('').reverse().map(Number);
  for (let i = 0; i < arr.length; i++) {
    c = d[c][p[i % 8][arr[i]]];
  }
  return c === 0;
}

export const PII_PATTERNS = {
  aadhaar: {
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    validator: verhoeffCheck,
    label: 'Aadhaar number',
    labelHi: 'आधार नंबर',
    severity: 'critical' as const,
  },
  pan: {
    pattern: /\b[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]\b/g,
    label: 'PAN card',
    labelHi: 'पैन कार्ड',
    severity: 'critical' as const,
  },
  upiId: {
    pattern: /\b[a-zA-Z0-9._-]+@(upi|paytm|ybl|okhdfcbank|okicici|oksbi|apl|axisbank|ibl|sbi|icici|hdfcbank)\b/g,
    label: 'UPI ID',
    labelHi: 'UPI आईडी',
    severity: 'high' as const,
  },
  indianPhone: {
    pattern: /(?:\+91|91|0)?[6-9]\d{9}\b/g,
    label: 'Phone number',
    labelHi: 'फ़ोन नंबर',
    severity: 'high' as const,
  },
  email: {
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    label: 'Email address',
    labelHi: 'ईमेल पता',
    severity: 'high' as const,
  },
  schoolName: {
    pattern: /\b(school|vidyalaya|vidya\s*mandir|public\s*school|international\s*school|convent|dav|kendriya|navodaya|dps|ryan|amity)\b/gi,
    label: 'School name',
    labelHi: 'स्कूल का नाम',
    severity: 'high' as const,
    contextRequired: true,
  },
  homeAddress: {
    pattern: /\b(flat\s*no|house\s*no|plot\s*no|sector\s*\d|block\s*[a-z]|lane\s*\d|gali\s*no)\b/gi,
    label: 'Home address',
    labelHi: 'घर का पता',
    severity: 'critical' as const,
  },
  parentName: {
    pattern: /(my\s+)?(father|mother|papa|mummy|dad|mom|pitaji|mataji)('s)?\s+(name\s+is|naam\s+hai|is)\s+[A-Z][a-z]+/gi,
    label: 'Parent name',
    labelHi: 'माता-पिता का नाम',
    severity: 'medium' as const,
  },
};
