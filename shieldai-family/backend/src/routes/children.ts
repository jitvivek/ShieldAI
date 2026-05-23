import { Router } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const childrenRouter = Router();

childrenRouter.get('/', async (req: AuthRequest, res) => {
  const children = await prisma.child.findMany({
    where: { parentId: req.parentId },
    include: { devices: true, settings: true },
  });
  res.json(children);
});

childrenRouter.post('/', async (req: AuthRequest, res) => {
  const { name, age, ageTier } = req.body;
  const child = await prisma.child.create({
    data: { name, age, ageTier, parentId: req.parentId! },
  });
  res.json(child);
});

childrenRouter.delete('/:id', async (req: AuthRequest, res) => {
  const child = await prisma.child.findFirst({
    where: { id: req.params.id, parentId: req.parentId },
  });
  if (!child) return res.status(404).json({ error: 'Not found' });
  await prisma.child.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});
