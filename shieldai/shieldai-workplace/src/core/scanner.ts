import pino from 'pino';
import type { ScanRequest, ScanResult, PiiMatch, PolicyViolation } from '../types/common';
import { scanForPii } from './piiScanner';
import { evaluatePolicy, loadPolicy } from './policyEngine';

const logger = pino({ name: 'scanner' });

const SHIELDAI_API_URL = process.env.SHIELDAI_API_URL || 'http://localhost:3000';
const SHIELDAI_API_KEY = process.env.SHIELDAI_API_KEY || '';

interface ApiDetectResponse {
  verdict: 'safe' | 'suspicious' | 'malicious';
  risk_score: number;
  category?: string;
  detected_language?: string;
  pii_detected?: Array<{ type: string; masked: string }>;
}

async function callShieldAiApi(text: string): Promise<ApiDetectResponse | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${SHIELDAI_API_URL}/v1/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SHIELDAI_API_KEY ? { 'X-API-Key': SHIELDAI_API_KEY } : {}),
      },
      body: JSON.stringify({ input: text }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      logger.warn({ status: res.status }, 'ShieldAI API returned non-OK');
      return null;
    }
    return (await res.json()) as ApiDetectResponse;
  } catch (err) {
    logger.warn({ err }, 'ShieldAI API call failed');
    return null;
  }
}

export async function scan(request: ScanRequest): Promise<ScanResult> {
  const startMs = Date.now();

  // Local PII scan (fast, no network)
  const piiMatches = scanForPii(request.text);

  // Remote ML scan
  const apiResult = await callShieldAiApi(request.text);

  // Determine verdict
  let verdict: ScanResult['verdict'] = 'safe';
  let riskScore = 0;
  let category = 'none';
  let language = 'en';

  if (apiResult) {
    verdict = apiResult.verdict;
    riskScore = apiResult.risk_score;
    category = apiResult.category || 'none';
    language = apiResult.detected_language || 'en';
  }

  // Elevate verdict if PII found
  if (piiMatches.length > 0 && verdict === 'safe') {
    verdict = 'suspicious';
    riskScore = Math.max(riskScore, 0.5);
    category = 'pii_exposure';
  }

  // Policy evaluation
  const policy = loadPolicy(request.orgId);
  const violations = policy
    ? evaluatePolicy(policy, { piiTypes: piiMatches.map((p) => p.type), category, verdict })
    : [];

  const shouldBlock = violations.some((v) => v.action === 'block') || verdict === 'malicious';
  const shouldFlag = violations.some((v) => v.action === 'flag') || verdict === 'suspicious';

  // DPDP flags
  const dpdpFlags: string[] = [];
  if (piiMatches.some((p) => p.type === 'aadhaar')) dpdpFlags.push('DPDP Section 8(1) — Sensitive personal data');
  if (piiMatches.some((p) => p.type === 'pan')) dpdpFlags.push('DPDP Section 8(1) — Financial identifier');

  // User-facing message
  let userMessage = 'Your message is safe.';
  if (shouldBlock) {
    const reasons = piiMatches.map((p) => `${p.masked} (${p.type})`).join(', ');
    userMessage = `Message blocked: ${reasons || category}`;
  } else if (shouldFlag) {
    userMessage = `Potential risk detected: ${category}`;
  }

  const latencyMs = Date.now() - startMs;

  return {
    verdict,
    riskScore,
    category,
    language,
    piiDetected: piiMatches,
    policyViolations: violations,
    dpdpFlags,
    shouldBlock,
    shouldFlag,
    userMessage,
    adminMessage: `[${request.platform}] user=${request.userId} channel=${request.channelId} verdict=${verdict} score=${riskScore} pii=${piiMatches.length} latency=${latencyMs}ms`,
  };
}
