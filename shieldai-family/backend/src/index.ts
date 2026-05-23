import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth';
import { childrenRouter } from './routes/children';
import { activityRouter } from './routes/activity';
import { alertsRouter } from './routes/alerts';
import { settingsRouter } from './routes/settings';
import { subscriptionRouter } from './routes/subscription';
import { webhookRouter } from './routes/webhooks';
import { authMiddleware } from './middleware/auth';
import { startCronJobs } from './cron';

export const prisma = new PrismaClient();
const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRouter);
app.use(express.json({ limit: '1mb' }));

// Public routes
app.use('/auth', authRouter);

// Protected routes
app.use('/children', authMiddleware, childrenRouter);
app.use('/activity', authMiddleware, activityRouter);
app.use('/alerts', authMiddleware, alertsRouter);
app.use('/settings', authMiddleware, settingsRouter);
app.use('/subscription', authMiddleware, subscriptionRouter);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ShieldAI backend running on port ${PORT}`);
  startCronJobs();
});
