// Shared types for ShieldAI Guard extension

export type Verdict = 'safe' | 'suspicious' | 'malicious';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface ScanRequest {
  type: 'SCAN_PROMPT';
  text: string;
  site: string;
  url: string;
}

export interface ScanResponse {
  verdict: Verdict;
  riskScore: number;
  category: string;
  language: string;
  piiDetected: PiiMatch[];
  details: string;
  offline: boolean;
}

export interface PiiMatch {
  type: string;
  label: string;
  masked: string;
  startIndex: number;
  endIndex: number;
}

export interface RuleMatch {
  id: string;
  name: string;
  category: string;
  severity: Severity;
  weight: number;
  description: string;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  site: string;
  verdict: Verdict;
  riskScore: number;
  category: string;
  language: string;
  textPreview: string;
  piiDetected: PiiMatch[];
  offline: boolean;
}

export interface ExtensionSettings {
  apiKey: string;
  apiUrl: string;
  piiProtection: boolean;
  harmfulContentFilter: boolean;
  injectionDetection: boolean;
  hindiHinglishDetection: boolean;
  notifications: boolean;
  badgeCounter: boolean;
  parentalControls: ParentalControlSettings;
  language: 'en' | 'hi';
}

export interface ParentalControlSettings {
  enabled: boolean;
  pin: string;
  ageTier: '8-12' | '13-15' | '16-17' | 'adult';
  activityLogging: boolean;
  parentEmail: string;
}

export interface DailyStats {
  date: string;
  scansToday: number;
  blocked: number;
  piiCaught: number;
  languagesDetected: string[];
}

export interface SiteAdapter {
  name: string;
  matchUrls: string[];
  getInputElement(): HTMLElement | null;
  getSubmitButton(): HTMLElement | null;
  extractText(input: HTMLElement): string;
  blockSubmission(input: HTMLElement): void;
  restoreSubmission(input: HTMLElement): void;
  injectWarning(message: string, severity: 'warning' | 'blocked'): void;
  removeWarning(): void;
}

export interface Rule {
  id: string;
  name: string;
  pattern: string;
  severity: Severity;
  weight: number;
  description: string;
}

export interface RuleCategory {
  category: string;
  description: string;
  rules: Rule[];
}
