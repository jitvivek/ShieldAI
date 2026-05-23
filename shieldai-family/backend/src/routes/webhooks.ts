import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../index';

export const webhookRouter = Router();

webhookRouter.post('/razorpay', async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const signature = req.headers['x-razorpay-signature'] as string;
  const body = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(body.toString());
  
  if (event.event === 'payment.captured') {
    const paymentId = event.payload.payment.entity.id;
    const notes = event.payload.payment.entity.notes;
    if (notes?.parentId) {
      await prisma.subscription.update({
        where: { parentId: notes.parentId },
        data: { status: 'active', razorpayId: paymentId },
      });
    }
  }

  res.json({ received: true });
});
