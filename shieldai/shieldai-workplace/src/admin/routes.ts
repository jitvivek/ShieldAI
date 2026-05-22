import { Router, Request, Response } from 'express';
import type express from 'express';
import pino from 'pino';

const logger = pino({ name: 'admin-routes' });

const router = Router();

// GET /admin/stats — scan statistics
router.get('/stats', async (_req: Request, res: Response) => {
  // In production, query from DB
  res.json({
    scansToday: 0,
    blocked: 0,
    flagged: 0,
    piiCaught: 0,
    topCategories: [],
    languageDistribution: {},
  });
});

// GET /admin/scan-logs — paginated audit logs
router.get('/scan-logs', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  // In production, query from DB with pagination
  res.json({ data: [], page, limit, total: 0 });
});

// GET /admin/pii-report — PII detections summary
router.get('/pii-report', async (_req: Request, res: Response) => {
  res.json({
    totalDetections: 0,
    byType: {},
    recentDetections: [],
  });
});

// GET /admin/compliance — DPDP compliance status
router.get('/compliance', async (_req: Request, res: Response) => {
  res.json({
    status: 'compliant',
    lastAudit: null,
    flags: [],
  });
});

// GET /admin/policies — current policy
router.get('/policies', async (_req: Request, res: Response) => {
  res.json({ policyName: 'default', policies: [] });
});

// PUT /admin/policies — update policy YAML
router.put('/policies', async (req: Request, res: Response) => {
  const { policyYaml } = req.body;
  if (!policyYaml || typeof policyYaml !== 'string') {
    res.status(400).json({ error: 'policyYaml is required' });
    return;
  }
  // In production, validate YAML and save to DB
  logger.info('Policy updated');
  res.json({ status: 'updated' });
});

// GET /admin/bots — configured bot list
router.get('/bots', async (_req: Request, res: Response) => {
  res.json({ bots: [] });
});

// POST /admin/bots — add a bot config
router.post('/bots', async (req: Request, res: Response) => {
  const { botUserId, botName, platform } = req.body;
  if (!botUserId || !botName || !platform) {
    res.status(400).json({ error: 'botUserId, botName, and platform are required' });
    return;
  }
  // In production, save to DB
  res.status(201).json({ status: 'created' });
});

export function registerAdminRoutes(app: express.Express): void {
  app.use('/admin', router);
  logger.info('Admin routes registered at /admin');
}
