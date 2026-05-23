import { Router } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const settingsRouter = Router();

settingsRouter.get('/:childId', async (req: AuthRequest, res) => {
  const settings = await prisma.childSettings.findUnique({
    where: { childId: req.params.childId },
  });
  res.json(settings);
});

settingsRouter.put('/:childId', async (req: AuthRequest, res) => {
  const { sensitivity, dailyLimitMins, nightModeStart, nightModeEnd, blockedApps, blockedKeywords, piiTypes } = req.body;
  const settings = await prisma.childSettings.upsert({
    where: { childId: req.params.childId },
    update: { sensitivity, dailyLimitMins, nightModeStart, nightModeEnd, blockedApps, blockedKeywords, piiTypes },
    create: { childId: req.params.childId, sensitivity, dailyLimitMins, nightModeStart, nightModeEnd, blockedApps, blockedKeywords, piiTypes },
  });
  res.json(settings);
});
