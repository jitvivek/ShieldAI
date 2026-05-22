import type { ScanResponse, Verdict } from '../shared/types';
import { runRuleEngine, calculateRiskScore, detectLanguage } from '../shared/ruleEngine';
import { scanForPii } from '../shared/piiPatterns';

export function runOfflineDetection(text: string, enableHindiHinglish = true): ScanResponse {
  const piiMatches = scanForPii(text);
  const ruleMatches = runRuleEngine(text, enableHindiHinglish);
  const riskScore = calculateRiskScore(ruleMatches);
  const language = detectLanguage(text);

  // Determine verdict
  let verdict: Verdict = 'safe';
  if (piiMatches.length > 0) {
    verdict = 'malicious'; // PII always blocks
  } else if (riskScore >= 0.85) {
    verdict = 'malicious';
  } else if (riskScore >= 0.50) {
    verdict = 'suspicious';
  }

  const category = ruleMatches.length > 0
    ? ruleMatches.sort((a, b) => b.weight - a.weight)[0].category
    : piiMatches.length > 0 ? 'pii_exposure' : 'none';

  const details = [
    ...ruleMatches.map(m => m.description),
    ...piiMatches.map(m => `${m.label}: ${m.masked}`),
  ].join('; ');

  return {
    verdict,
    riskScore: Math.max(riskScore, piiMatches.length > 0 ? 0.90 : 0),
    category,
    language,
    piiDetected: piiMatches,
    details,
    offline: true,
  };
}
