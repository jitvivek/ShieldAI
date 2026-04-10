/**
 * Route aggregator — registers all v1 routes and applies middleware.
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { logsQuerySchema } from '../utils/validators';

import detectRouter from './v1/detect';
import healthRouter from './v1/health';
import apiKeysRouter from './v1/apiKeys';
// PHASE 2 ADDITION
import guardRouter from './v1/guard';
import scanOutputRouter from './v1/scan-output';
import policiesRouter from './v1/policies';

const prisma = new PrismaClient();

export function registerRoutes(app: Router): void {
  // Public routes (no auth)
  app.use('/v1/health', healthRouter);

  // Authenticated and rate-limited routes
  app.use('/v1/detect', authMiddleware, rateLimitMiddleware, detectRouter);
  app.use('/v1/api-keys', authMiddleware, apiKeysRouter);

  // PHASE 2 ADDITION: Guard, output scanner, and policies
  app.use('/v1/guard', authMiddleware, rateLimitMiddleware, guardRouter);
  app.use('/v1/scan/output', authMiddleware, rateLimitMiddleware, scanOutputRouter);
  app.use('/v1/policies', authMiddleware, policiesRouter);

  // Scan logs endpoint
  app.get('/v1/logs', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    const auth = req.auth!;
    const query = logsQuerySchema.parse(req.query);

    const where: Record<string, unknown> = { customerId: auth.customerId };
    if (query.verdict) where['verdict'] = query.verdict;
    if (query.start_date || query.end_date) {
      where['createdAt'] = {};
      if (query.start_date)
        (where['createdAt'] as Record<string, unknown>)['gte'] = new Date(query.start_date);
      if (query.end_date)
        (where['createdAt'] as Record<string, unknown>)['lte'] = new Date(query.end_date);
    }

    const [data, total] = await Promise.all([
      prisma.scanLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.per_page,
        take: query.per_page,
        select: {
          id: true,
          requestId: true,
          verdict: true,
          riskScore: true,
          category: true,
          ruleScore: true,
          mlScore: true,
          entropyScore: true,
          semanticScore: true,
          matchedRules: true,
          latencyMs: true,
          degraded: true,
          inputLength: true,
          createdAt: true,
        },
      }),
      prisma.scanLog.count({ where }),
    ]);

    res.json({
      data,
      total,
      page: query.page,
      per_page: query.per_page,
      total_pages: Math.ceil(total / query.per_page),
    });
  });

  // Dashboard stats endpoint
  app.get(
    '/v1/stats',
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
      const auth = req.auth!;
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [total24h, blocked24h, flagged24h, avgLatency, verdictDist, dailyScans] =
        await Promise.all([
          prisma.scanLog.count({
            where: { customerId: auth.customerId, createdAt: { gte: oneDayAgo } },
          }),
          prisma.scanLog.count({
            where: {
              customerId: auth.customerId,
              createdAt: { gte: oneDayAgo },
              verdict: 'block',
            },
          }),
          prisma.scanLog.count({
            where: {
              customerId: auth.customerId,
              createdAt: { gte: oneDayAgo },
              verdict: 'flag',
            },
          }),
          prisma.scanLog.aggregate({
            where: { customerId: auth.customerId, createdAt: { gte: oneDayAgo } },
            _avg: { latencyMs: true },
          }),
          prisma.scanLog.groupBy({
            by: ['verdict'],
            where: { customerId: auth.customerId, createdAt: { gte: sevenDaysAgo } },
            _count: true,
          }),
          prisma.$queryRaw`
            SELECT DATE(created_at) as date, COUNT(*)::int as count
            FROM scan_logs
            WHERE customer_id = ${auth.customerId}
              AND created_at >= ${sevenDaysAgo}
            GROUP BY DATE(created_at)
            ORDER BY date ASC
          ` as Promise<Array<{ date: string; count: number }>>,
        ]);

      res.json({
        total_scans_24h: total24h,
        blocked_24h: blocked24h,
        flagged_24h: flagged24h,
        avg_latency_ms: Math.round(avgLatency._avg.latencyMs ?? 0),
        verdict_distribution: verdictDist.map((v) => ({
          verdict: v.verdict,
          count: v._count,
        })),
        daily_scans: dailyScans,
      });
    },
  );

  // Rule reload endpoint (admin)
  app.post('/v1/rules/reload', authMiddleware, async (_req: Request, res: Response): Promise<void> => {
    const { reloadRules, getRuleCount } = await import('../services/ruleEngine');
    reloadRules();
    res.json({ message: 'Rules reloaded', rule_count: getRuleCount() });
  });
}
