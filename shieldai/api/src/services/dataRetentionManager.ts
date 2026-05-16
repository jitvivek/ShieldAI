/**
 * DPDP-compliant data retention manager.
 * Auto-purges expired scan logs per customer retention policy.
 * Runs as a daily cron job at 2:00 AM IST.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

/**
 * Purge scan logs past their expiration date (DPDP data minimization).
 */
export async function purgeExpiredLogs(): Promise<number> {
  const now = new Date();
  const deleted = await prisma.scanLog.deleteMany({
    where: {
      expiresAt: {
        not: null,
        lte: now,
      },
    },
  });

  logger.info({ count: deleted.count, timestamp: now.toISOString() }, 'DPDP compliance: purged expired scan logs');
  return deleted.count;
}

/**
 * Get count of logs pending purge (for compliance dashboard).
 */
export async function getLogsPendingPurge(): Promise<number> {
  const now = new Date();
  const count = await prisma.scanLog.count({
    where: {
      expiresAt: {
        not: null,
        lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // next 7 days
      },
    },
  });
  return count;
}

/**
 * Get the oldest log timestamp for a customer.
 */
export async function getOldestLogDate(customerId: string): Promise<Date | null> {
  const oldest = await prisma.scanLog.findFirst({
    where: { customerId },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true },
  });
  return oldest?.createdAt ?? null;
}

/**
 * Set expiration dates for logs that don't have one yet,
 * based on the customer's retention policy.
 */
export async function backfillExpirationDates(): Promise<number> {
  const customers = await prisma.customer.findMany({
    select: { id: true, dataRetentionDays: true },
  });

  let updated = 0;
  for (const customer of customers) {
    const result = await prisma.scanLog.updateMany({
      where: {
        customerId: customer.id,
        expiresAt: null,
      },
      data: {
        expiresAt: new Date(Date.now() + customer.dataRetentionDays * 24 * 60 * 60 * 1000),
      },
    });
    updated += result.count;
  }

  logger.info({ updated }, 'Backfilled expiration dates for scan logs');
  return updated;
}

/**
 * Schedule daily purge. Call this during app startup.
 * Uses setInterval for simplicity; switch to node-cron for production.
 */
let purgeInterval: NodeJS.Timeout | null = null;

export function scheduleDailyPurge(): void {
  if (purgeInterval) return;

  // Run once on startup
  purgeExpiredLogs().catch(err => {
    logger.error({ err }, 'Failed initial purge of expired logs');
  });

  // Then every 24 hours
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  purgeInterval = setInterval(() => {
    purgeExpiredLogs().catch(err => {
      logger.error({ err }, 'Failed scheduled purge of expired logs');
    });
  }, ONE_DAY_MS);

  logger.info('Scheduled daily DPDP data retention purge');
}

export function stopDailyPurge(): void {
  if (purgeInterval) {
    clearInterval(purgeInterval);
    purgeInterval = null;
  }
}
