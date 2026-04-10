/**
 * Phase 2 — Guard request/response types for the unified guardrail system.
 */

export type GuardVerdict = 'pass' | 'flag' | 'block';

// --- Guard Request Types ---

export interface GuardRequest {
  input: string;
  llm_provider?: 'openai' | 'anthropic' | 'azure' | 'custom';
  llm_config?: LlmConfig;
  policy?: string; // policy name or inline YAML
  output?: string; // pre-generated LLM output (skip LLM call)
  system_prompt?: string; // for prompt leak detection
  canary_tokens?: string[]; // for canary detection
}

export interface LlmConfig {
  model: string;
  api_key: string;
  base_url?: string;
}

// --- Guard Response Types ---

export interface GuardResponse {
  request_id: string;
  input_verdict: InputVerdictResult;
  output_verdict?: OutputScanResult;
  safe_output?: string;
  policy_results: PolicyResult[];
  degraded: boolean;
  latency_ms: number;
}

export interface InputVerdictResult {
  verdict: GuardVerdict;
  risk_score: number;
  category: string | null;
  explanation: string;
  jailbreak_score?: number;
  jailbreak_label?: string;
}

// --- Output Scanner Types ---

export interface OutputScanResult {
  verdict: GuardVerdict;
  policyViolations: PolicyViolation[];
  piiDetected: PiiMatch[];
  promptLeakScore: number;
  canaryDetected: boolean;
  cleanedOutput?: string;
  processingTimeMs: number;
}

export interface PolicyViolation {
  policyName: string;
  action: PolicyAction;
  severity: PolicySeverity;
  detector: string;
  detail: string;
}

export type PolicyAction = 'block' | 'flag' | 'redact' | 'truncate';
export type PolicySeverity = 'critical' | 'high' | 'medium' | 'low';

// --- PII Types ---

export interface PiiMatch {
  type: PiiType;
  value: string; // masked version
  startIndex: number;
  endIndex: number;
}

export type PiiType =
  | 'email'
  | 'phone_india'
  | 'phone_intl'
  | 'aadhaar'
  | 'pan'
  | 'credit_card'
  | 'ip_address';

// --- Policy Engine Types ---

export interface PolicyConfig {
  name: string;
  version: number;
  policies: PolicyRule[];
}

export interface PolicyRule {
  name: string;
  action: PolicyAction;
  severity: PolicySeverity;
  detector: string;
  patterns?: string[];
  categories?: string[];
  blocked_terms_file?: string;
  max_tokens?: number;
  threshold?: number;
}

export interface PolicyResult {
  policyName: string;
  passed: boolean;
  action: PolicyAction;
  severity: PolicySeverity;
  detail?: string;
}

// --- Jailbreak Classifier Types ---

export type JailbreakLabel =
  | 'safe'
  | 'roleplay_exploit'
  | 'hypothetical_framing'
  | 'instruction_override'
  | 'encoding_evasion';

export interface JailbreakClassifyResult {
  label: JailbreakLabel;
  confidence: number;
  probabilities: Record<JailbreakLabel, number>;
  inferenceTimeMs: number;
}

// --- Prompt Shield Types ---

export interface PromptShieldResult {
  leakDetected: boolean;
  leakScore: number;
  method: 'jaccard' | 'embedding' | 'lcs' | null;
  detail: string;
}

// --- Scan Output Request ---

export interface ScanOutputRequest {
  output: string;
  policy?: string;
  system_prompt?: string;
  canary_tokens?: string[];
}
