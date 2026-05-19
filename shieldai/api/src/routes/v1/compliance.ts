/**
 * Compliance routes — regulatory compliance status and reporting.
 *
 * @swagger
 * /v1/compliance/status:
 *   get:
 *     summary: Get compliance status
 *     description: Get regulatory compliance status for the authenticated customer
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compliance status
 * /v1/compliance/report:
 *   get:
 *     summary: Generate compliance report
 *     description: Generate a detailed compliance report for the last 30 days
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compliance report
 */

import { Router, Request, Response } from 'express';
import { generateComplianceReport } from '../../services/complianceReportGenerator';
import { logger } from '../../config/logger';

const router = Router();

router.get('/status', async (req: Request, res: Response): Promise<void> => {
  const customerId = (req as unknown as Record<string, unknown>).customerId as string;
  const customerIndustry = (req as unknown as Record<string, unknown>).customerIndustry as string | undefined;

  try {
    const report = await generateComplianceReport(customerId, customerIndustry);

    res.json({
      customer_id: report.customerId,
      overall_status: report.overallStatus,
      regulations: Object.fromEntries(
        Object.entries(report.regulations).map(([key, reg]) => [
          key,
          {
            status: reg.status,
            violations_30d: reg.violations30d,
            sections_triggered: reg.sectionsTriggered,
            description: reg.description,
            ...(reg.reason ? { reason: reg.reason } : {}),
          },
        ]),
      ),
      data_retention: {
        policy_days: report.dataRetention.policyDays,
        oldest_log: report.dataRetention.oldestLog,
        next_purge: report.dataRetention.nextPurge,
        logs_pending_purge: report.dataRetention.logsPendingPurge,
      },
      recommendations: report.recommendations,
    });
  } catch (err) {
    logger.error({ err, customerId }, 'Failed to generate compliance status');
    res.status(500).json({ error: { message: 'Failed to generate compliance status' } });
  }
});

router.get('/report', async (req: Request, res: Response): Promise<void> => {
  const customerId = (req as unknown as Record<string, unknown>).customerId as string;
  const customerIndustry = (req as unknown as Record<string, unknown>).customerIndustry as string | undefined;

  try {
    const report = await generateComplianceReport(customerId, customerIndustry);
    res.json(report);
  } catch (err) {
    logger.error({ err, customerId }, 'Failed to generate compliance report');
    res.status(500).json({ error: { message: 'Failed to generate compliance report' } });
  }
});

export default router;
