/**
 * Indian PII types — Aadhaar, PAN, UPI, IFSC, etc.
 * Mapped to DPDP Act sections for regulatory compliance.
 */

export type PiiType =
  | 'aadhaar'
  | 'pan'
  | 'upi_id'
  | 'ifsc'
  | 'indian_phone'
  | 'indian_passport'
  | 'voter_id_epic'
  | 'indian_bank_account'
  | 'email'
  | 'credit_card';

export type PiiSeverity = 'medium' | 'high' | 'critical';

export interface PiiMatch {
  type: PiiType;
  value: string;               // masked: "XXXX-XXXX-1234"
  position: { start: number; end: number };
  severity: PiiSeverity;
  dpdpSection: string;         // regulatory reference
  validated: boolean;          // passed checksum/format validation
}

export interface PiiScanResult {
  piiFound: boolean;
  matches: PiiMatch[];
  dpdpFlags: string[];         // relevant DPDP Act sections triggered
  processingTimeMs: number;
}

export interface PiiPatternConfig {
  pattern: RegExp;
  validator?: (match: string) => boolean;
  description: string;
  severity: PiiSeverity;
  dpdpSection: string;
}
