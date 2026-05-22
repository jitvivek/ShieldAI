import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp({ name: 'http' }));

  // Root
  app.get('/', (_req, res) => {
    res.json({
      service: 'ShieldAI Workplace',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        admin: '/admin/stats',
        scanLogs: '/admin/scan-logs',
        compliance: '/admin/compliance',
        policies: '/admin/policies',
        bots: '/admin/bots',
      },
    });
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'shieldai-workplace', timestamp: new Date().toISOString() });
  });

  return app;
}
