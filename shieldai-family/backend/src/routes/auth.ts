import { Router } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { uid, phone, name, email, pinHash } = req.body;
  try {
    const parent = await prisma.parent.create({
      data: { id: uid, phone, name, email, pinHash },
    });
    res.json({ id: parent.id });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

authRouter.get('/me', async (req: AuthRequest, res) => {
  const parent = await prisma.parent.findUnique({
    where: { id: req.parentId },
    include: { children: true, subscription: true },
  });
  if (!parent) return res.status(404).json({ error: 'Not found' });
  res.json(parent);
});
