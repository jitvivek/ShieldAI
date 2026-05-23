import { Router } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const activityRouter = Router();

activityRouter.get('/:childId', async (req: AuthRequest, res) => {
  const child = await prisma.child.findFirst({
    where: { id: req.params.childId, parentId: req.parentId },
  });
  if (!child) return res.status(404).json({ error: 'Not found' });

  const activities = await prisma.activity.findMany({
    where: { childId: req.params.childId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(activities);
});

activityRouter.post('/:childId', async (req: AuthRequest, res) => {
  const { appPackage, appName, text, verdict, confidence, category, language, matchedRules } = req.body;
  const activity = await prisma.activity.create({
    data: {
      childId: req.params.childId,
      appPackage, appName, text, verdict, confidence, category, language,
      matchedRules: matchedRules || [],
    },
  });
  res.json(activity);
});
