export interface ScanRequest {
  text: string;
  userId: string;
  platform: 'teams' | 'slack';
  channelId: string;
  isToBot: boolean;
  isBotResponse: boolean;
  orgId: string;
}

export interface PiiMatch {
  type: string;
  value: string;
  masked: string;
  position: { start: number; end: number };
}

export interface PolicyViolation {
  policyName: string;
  action: 'block' | 'flag' | 'log';
  message: string;
  detector: string;
}

export interface ScanResult {
  verdict: 'safe' | 'suspicious' | 'malicious';
  riskScore: number;
  category: string;
  language: string;
  piiDetected: PiiMatch[];
  policyViolations: PolicyViolation[];
  dpdpFlags: string[];
  shouldBlock: boolean;
  shouldFlag: boolean;
  userMessage: string;
  adminMessage: string;
}

export interface PolicyRule {
  name: string;
  action: 'block' | 'flag' | 'log';
  detector: string;
  patterns?: string[];
  categories?: string[];
  message: string;
}

export interface PolicyConfig {
  name: string;
  org_type?: string;
  policies: PolicyRule[];
}

export interface BotInfo {
  userId: string;
  name: string;
  platform: 'teams' | 'slack';
  isActive: boolean;
}
