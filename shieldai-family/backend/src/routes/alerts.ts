import { Router } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const alertsRouter = Router();

alertsRouter.get('/:childId', async (req: AuthRequest, res) => {
  const child = await prisma.child.findFirst({
    where: { id: req.params.childId, parentId: req.parentId },
  });
  if (!child) return res.status(404).json({ error: 'Not found' });

  const alerts = await prisma.alert.findMany({
    where: { childId: req.params.childId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(alerts);
});

alertsRouter.patch('/:id/read', async (req: AuthRequest, res) => {
  await prisma.alert.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });
  res.json({ success: true });
});
