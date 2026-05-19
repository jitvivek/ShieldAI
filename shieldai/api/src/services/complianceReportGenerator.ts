/**
 * Compliance report generator — builds JSON/HTML compliance summaries.
 * PDF generation can be added via puppeteer or a headless Chrome service.
 */

import { PrismaClient } from '@prisma/client';
import { INDIA_REGULATIONS, mapDetectionToRegulations, generateRecommendations } from './complianceEngine';
import type { ComplianceViolation, RegulationStatus } from './complianceEngine';
import { getLogsPendingPurge, getOldestLogDate } from './dataRetentionManager';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

export interface ComplianceReport {
  customerId: string;
  generatedAt: string;
  period: string;
  overallStatus: 'compliant' | 'needs_review' | 'violation';
  regulations: Record<string, RegulationStatus>;
  dataRetention: {
    policyDays: number;
    oldestLog: string | null;
    nextPurge: string;
    logsPendingPurge: number;
  };
  recommendations: string[];
  summary: {
    totalScans: number;
    blockedScans: number;
    flaggedScans: number;
    piiDetections: number;
    injectionAttempts: number;
    languageBreakdown: Record<string, number>;
  };
}

/**
 * Generate a compliance report for a customer over the last 30 days.
 */
export async function generateComplianceReport(
  customerId: string,
  customerIndustry?: string,
): Promise<ComplianceReport> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const now = new Date();

  // Fetch recent scan logs
  const logs = await prisma.scanLog.findMany({
    where: {
      customerId,
      createdAt: { gte: thirtyDaysAgo },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Aggregate statistics
  const totalScans = logs.length;
  const blockedScans = logs.filter(l => l.verdict === 'block').length;
  const flaggedScans = logs.filter(l => l.verdict === 'flag').length;

  let piiDetections = 0;
  let injectionAttempts = 0;
  const languageBreakdown: Record<string, number> = {};
  const allViolations: ComplianceViolation[] = [];

  for (const log of logs) {
    // Count PII detections
    const pii = log.piiDetected as Array<{ type: string; severity: string; dpdpSection: string }> | null;
    if (pii && pii.length > 0) piiDetections += pii.length;

    // Count injection attempts
    if (log.verdict === 'block' && log.category) injectionAttempts++;

    // Language breakdown
    const lang = log.detectedLanguage || 'en';
    languageBreakdown[lang] = (languageBreakdown[lang] || 0) + 1;

    // Map to regulations
    const mapping = mapDetectionToRegulations(
      { verdict: log.verdict, category: log.category ?? undefined, piiDetected: pii ?? undefined },
      customerIndustry,
    );
    allViolations.push(...mapping.violations);
  }

  // Build per-regulation status
  const regulations: Record<string, RegulationStatus> = {};

  for (const [regKey, regulation] of Object.entries(INDIA_REGULATIONS)) {
    const regViolations = allViolations.filter(v => v.regulation === regKey);
    const isApplicable = !regulation.applicableTo ||
      (customerIndustry && regulation.applicableTo.includes(customerIndustry));

    if (!isApplicable) {
      regulations[regKey] = {
        status: 'not_applicable',
        violations30d: 0,
        sectionsTriggered: [],
        description: regulation.name,
        reason: `Customer industry not in [${regulation.applicableTo?.join(', ')}]`,
      };
    } else {
      const sectionsTriggered = [...new Set(regViolations.map(v => v.section))];
      regulations[regKey] = {
        status: regViolations.length === 0
          ? 'compliant'
          : regViolations.some(v => v.severity === 'critical')
            ? 'violation'
            : 'needs_review',
        violations30d: regViolations.length,
        sectionsTriggered,
        description: buildRegDescription(regKey, regViolations),
      };
    }
  }

  // Data retention info
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { dataRetentionDays: true },
  });

  const retentionDays = customer?.dataRetentionDays ?? 90;
  const oldestLog = await getOldestLogDate(customerId);
  const logsPendingPurge = await getLogsPendingPurge();

  // Next purge at 2:00 AM IST tomorrow
  const nextPurge = new Date(now);
  nextPurge.setDate(nextPurge.getDate() + 1);
  nextPurge.setUTCHours(20, 30, 0, 0); // 2:00 AM IST = 20:30 UTC prev day

  const overallStatus: ComplianceReport['overallStatus'] =
    Object.values(regulations).some(r => r.status === 'violation')
      ? 'violation'
      : Object.values(regulations).some(r => r.status === 'needs_review')
        ? 'needs_review'
        : 'compliant';

  const recommendations = generateRecommendations(allViolations);

  return {
    customerId,
    generatedAt: now.toISOString(),
    period: `${thirtyDaysAgo.toISOString().slice(0, 10)} to ${now.toISOString().slice(0, 10)}`,
    overallStatus,
    regulations,
    dataRetention: {
      policyDays: retentionDays,
      oldestLog: oldestLog?.toISOString() ?? null,
      nextPurge: nextPurge.toISOString(),
      logsPendingPurge,
    },
    recommendations,
    summary: {
      totalScans,
      blockedScans,
      flaggedScans,
      piiDetections,
      injectionAttempts,
      languageBreakdown,
    },
  };
}

function buildRegDescription(regKey: string, violations: ComplianceViolation[]): string {
  if (violations.length === 0) return 'No violations detected in the last 30 days.';
  const topSection = violations[0]!.sectionTitle;
  return `${violations.length} violation(s) detected. Most recent: ${topSection}.`;
}
