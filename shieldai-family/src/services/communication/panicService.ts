import { Platform, Linking } from 'react-native';
import { pushNotifications } from './pushNotifications';
import { whatsappReporter } from './whatsappReporter';
import { smsReporter } from './smsReporter';
import { useAuthStore } from '@/store/authStore';
import { useActivityStore } from '@/store/activityStore';
import { CONFIG } from '@/constants/config';

class PanicService {
  async triggerPanic(): Promise<void> {
    const { user } = useAuthStore.getState();
    const { activities } = useActivityStore.getState();
    const recentActivities = activities.slice(0, 10);

    // 1. Send push notification to parent
    await this.notifyParent(user?.childName ?? 'Your child');

    // 2. Send WhatsApp message
    if (user?.parentPhone) {
      await whatsappReporter.sendWeeklyReport(user.parentPhone, {
        childName: user.childName ?? 'Child',
        dateRange: 'PANIC ALERT',
        total: 0,
        safeCount: 0,
        flaggedCount: 0,
        blockedCount: 0,
        totalTime: '0',
        safetyScore: 0,
      });
    }

    // 3. Send SMS fallback
    if (user?.parentPhone) {
      await smsReporter.send(
        user.parentPhone,
        `🚨 PANIC: ${user.childName ?? 'Your child'} pressed the panic button in ShieldAI Family. Please check on them immediately.`
      );
    }

    // 4. Log panic event to backend
    try {
      await fetch(`${CONFIG.BACKEND_API_URL}/panic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: user?.childId,
          recentActivities: recentActivities.map((a) => a.id),
        }),
      });
    } catch {
      // Network failure — SMS already sent as fallback
    }
  }

  private async notifyParent(childName: string): Promise<void> {
    await pushNotifications.sendLocalNotification(
      '🚨 Panic Alert',
      `${childName} pressed the panic button. Check in with them now.`,
      'panic'
    );
  }

  async sendDirectSms(phone: string, message: string): Promise<void> {
    if (Platform.OS === 'android') {
      const url = `sms:${phone}?body=${encodeURIComponent(message)}`;
      await Linking.openURL(url);
    }
  }
}

export const panicService = new PanicService();
