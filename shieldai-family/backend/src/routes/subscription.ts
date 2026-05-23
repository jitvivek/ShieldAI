import { Router } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const subscriptionRouter = Router();

subscriptionRouter.get('/', async (req: AuthRequest, res) => {
  const sub = await prisma.subscription.findUnique({ where: { parentId: req.parentId } });
  res.json(sub || { plan: 'free', status: 'active' });
});

subscriptionRouter.post('/create', async (req: AuthRequest, res) => {
  const { plan, razorpayId } = req.body;
  const sub = await prisma.subscription.upsert({
    where: { parentId: req.parentId! },
    update: { plan, status: 'active', razorpayId, currentPeriodEnd: new Date(Date.now() + 30 * 86400000) },
    create: { parentId: req.parentId!, plan, status: 'active', razorpayId, currentPeriodEnd: new Date(Date.now() + 30 * 86400000) },
  });
  res.json(sub);
});
