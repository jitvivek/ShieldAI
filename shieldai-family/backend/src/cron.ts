import cron from 'node-cron';
import { prisma } from './index';

export function startCronJobs() {
  // Weekly report generation - every Sunday at 9 AM IST
  cron.schedule('0 9 * * 0', async () => {
    console.log('Generating weekly reports...');
    const parents = await prisma.parent.findMany({ include: { children: true } });
    for (const parent of parents) {
      for (const child of parent.children) {
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const activities = await prisma.activity.findMany({
          where: { childId: child.id, createdAt: { gte: weekAgo } },
        });
        const alerts = await prisma.alert.findMany({
          where: { childId: child.id, createdAt: { gte: weekAgo } },
        });
        // TODO: Send WhatsApp/email report via Twilio
        console.log(`Report for ${child.name}: ${activities.length} activities, ${alerts.length} alerts`);
      }
    }
  }, { timezone: 'Asia/Kolkata' });

  // Expired subscription cleanup - daily at midnight
  cron.schedule('0 0 * * *', async () => {
    await prisma.subscription.updateMany({
      where: { currentPeriodEnd: { lt: new Date() }, status: 'active' },
      data: { status: 'expired' },
    });
  });
}
