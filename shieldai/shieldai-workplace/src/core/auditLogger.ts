import pino from 'pino';
import { hashUserId } from './piiScanner';
import type { ScanRequest, ScanResult } from '../types/common';

const logger = pino({ name: 'audit-logger' });

export interface AuditEntry {
  orgId: string;
  platform: 'teams' | 'slack';
  userIdHash: string;
  channelId: string;
  direction: 'to_bot' | 'from_bot';
  verdict: string;
  riskScore: number;
  category: string;
  language: string;
  piiDetected: unknown;
  policyViolations: unknown;
  dpdpFlags: string[];
  actionTaken: string;
  latencyMs: number;
}

export function buildAuditEntry(
  request: ScanRequest,
  result: ScanResult,
  latencyMs: number
): AuditEntry {
  return {
    orgId: request.orgId,
    platform: request.platform,
    userIdHash: hashUserId(request.userId),
    channelId: request.channelId,
    direction: request.isBotResponse ? 'from_bot' : 'to_bot',
    verdict: result.verdict,
    riskScore: result.riskScore,
    category: result.category,
    language: result.language,
    piiDetected: result.piiDetected.map((p) => ({ type: p.type, masked: p.masked })),
    policyViolations: result.policyViolations,
    dpdpFlags: result.dpdpFlags,
    actionTaken: result.shouldBlock ? 'blocked' : result.shouldFlag ? 'flagged' : 'allowed',
    latencyMs,
  };
}

export function logAudit(entry: AuditEntry): void {
  logger.info({ audit: entry }, 'Scan audit log');
}
