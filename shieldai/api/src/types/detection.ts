/**
 * Core detection types for the ShieldAI pipeline.
 */

export interface DetectRequest {
  input: string;
  config?: DetectConfig;
}

export interface DetectConfig {
  threshold?: number;
  categories?: string;
  include_breakdown?: boolean;
  language_hint?: string;
}

export interface DetectResponse {
  request_id: string;
  verdict: Verdict;
  risk_score: number;
  category: string | null;
  subcategory: string | null;
  explanation: string;
  degraded: boolean;
  breakdown?: DetectBreakdown;
  preprocessing?: PreprocessingSummary;
  pii?: PiiSummary;
  language?: LanguageSummary;
  latency_ms: number;
}

export interface PiiSummary {
  detected: boolean;
  types: string[];
  count: number;
}

export interface LanguageSummary {
  detected: string;
  is_code_mixed: boolean;
  classifier_used: string;
}

export type Verdict = 'pass' | 'flag' | 'block';

export interface DetectBreakdown {
  rule_engine: {
    score: number;
    matched_rules: string[];
    structural_flags: string[];
  };
  ml_classifier: {
    score: number;
    label: string;
    confidence: number;
  } | null;
  semantic_similarity: {
    score: number;
    nearest_pattern: string | null;
  } | null;
  entropy: {
    score: number;
    status: string;
  };
}

export interface PreprocessingSummary {
  encodings_detected: string[];
  homoglyphs_found: number;
  invisible_chars_removed: number;
}

export interface PreprocessorResult {
  original: string;
  normalized: string;
  deleetified: string;
  acronymExpanded: string;
  encodingsDetected: string[];
  homoglyphsFound: number;
  invisibleCharsRemoved: number;
  acronymExpansionsFound: number;
  processingTimeMs: number;
}

export interface MatchedRule {
  ruleId: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  weight: number;
  matchedText: string;
  pattern: string;
}

export interface RuleEngineResult {
  score: number;
  matchedRules: MatchedRule[];
  structuralFlags: string[];
  processingTimeMs: number;
}

export interface EntropyResult {
  overallEntropy: number;
  isAnomalous: boolean;
  anomalyScore: number;
  segmentEntropies: Array<{
    text: string;
    entropy: number;
    encoding: string | null;
  }>;
}

export interface ClassifyRequest {
  text: string;
  normalized_text: string;
}

export interface ClassifyResponse {
  label: 'safe' | 'suspicious' | 'malicious';
  confidence: number;
  probabilities: {
    safe: number;
    suspicious: number;
    malicious: number;
  };
  inference_time_ms: number;
}

export interface EmbedRequest {
  texts: string[];
}

export interface EmbedResponse {
  embeddings: number[][];
  inference_time_ms: number;
}

export interface RiskScore {
  score: number;
  source: 'rule_veto' | 'weighted_fusion';
}

export interface RuleDefinition {
  id: string;
  name: string;
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  weight: number;
  description: string;
}

export interface RuleFile {
  category: string;
  description: string;
  rules: RuleDefinition[];
}

export interface SemanticSimilarityResult {
  score: number;
  nearestPattern: string | null;
  processingTimeMs: number;
}

export interface MLClassifierResult {
  score: number;
  label: string;
  confidence: number;
  processingTimeMs: number;
}

export interface PipelineResult {
  requestId: string;
  verdict: Verdict;
  riskScore: number;
  category: string | null;
  subcategory: string | null;
  explanation: string;
  degraded: boolean;
  breakdown: DetectBreakdown;
  preprocessing: PreprocessingSummary;
  pii: PiiSummary;
  language: LanguageSummary;
  latencyMs: number;
  ruleEngineResult: RuleEngineResult;
  mlResult: MLClassifierResult | null;
  entropyResult: EntropyResult;
  semanticResult: SemanticSimilarityResult | null;
}
