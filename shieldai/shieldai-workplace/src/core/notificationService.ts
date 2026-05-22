import pino from 'pino';

const logger = pino({ name: 'notification-service' });

export interface AdminNotification {
  orgId: string;
  platform: 'teams' | 'slack';
  type: 'block' | 'pii_alert' | 'policy_violation';
  summary: string;
  details: string;
  adminEmails: string[];
}

export async function notifyAdmins(notification: AdminNotification): Promise<void> {
  // In production, this would send emails, webhook calls, or push notifications.
  // For now, log the notification.
  logger.warn(
    {
      orgId: notification.orgId,
      type: notification.type,
      platform: notification.platform,
    },
    `ADMIN ALERT: ${notification.summary}`
  );
}
