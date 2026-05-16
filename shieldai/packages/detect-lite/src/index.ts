import { RuleEngine, loadBuiltInRules } from './ruleEngine';
import { analyzeEntropy } from './entropyAnalyzer';
import { normalizeIndic, detectScript } from './indicNormalizer';

export interface DetectOptions {
  /** Override built-in rules with custom YAML rule file paths */
  customRules?: string[];
  /** Enable Indic language normalization (default: true) */
  indicNormalization?: boolean;
  /** Score threshold for blocking (default: 0.7) */
  blockThreshold?: number;
}

export interface DetectResult {
  verdict: 'PASS' | 'FLAG' | 'BLOCK';
  score: number;
  flags: string[];
  detectedLanguage: string;
  latencyMs: number;
}

const DEFAULT_BLOCK = 0.7;
const DEFAULT_FLAG = 0.3;

let cachedEngine: RuleEngine | null = null;

function getEngine(customRules?: string[]): RuleEngine {
  if (customRules) return new RuleEngine(customRules);
  if (!cachedEngine) cachedEngine = new RuleEngine(loadBuiltInRules());
  return cachedEngine;
}

/**
 * Detect prompt injection / jailbreak attempts locally (no network calls).
 */
export function detect(input: string, options?: DetectOptions): DetectResult {
  const start = performance.now();
  const blockThreshold = options?.blockThreshold ?? DEFAULT_BLOCK;
  const doIndic = options?.indicNormalization ?? true;

  // Normalize Indic text
  let normalized = input;
  let detectedLanguage = 'en';
  if (doIndic) {
    const script = detectScript(input);
    if (script !== 'latin') {
      detectedLanguage = script;
      normalized = normalizeIndic(input);
    }
  }

  const engine = getEngine(options?.customRules);

  // Rule engine scoring
  const ruleResult = engine.scan(normalized);

  // Entropy scoring
  const entropyScore = analyzeEntropy(normalized);

  // Combined score (rules 60%, entropy 40% for lite version)
  const score = Math.min(1, ruleResult.score * 0.6 + entropyScore * 0.4);

  let verdict: 'PASS' | 'FLAG' | 'BLOCK';
  if (score >= blockThreshold) verdict = 'BLOCK';
  else if (score >= DEFAULT_FLAG) verdict = 'FLAG';
  else verdict = 'PASS';

  return {
    verdict,
    score: Math.round(score * 1000) / 1000,
    flags: ruleResult.flags,
    detectedLanguage,
    latencyMs: Math.round((performance.now() - start) * 100) / 100,
  };
}

export { RuleEngine, loadBuiltInRules } from './ruleEngine';
export { analyzeEntropy } from './entropyAnalyzer';
export { normalizeIndic, detectScript } from './indicNormalizer';
