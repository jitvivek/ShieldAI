import { CONFIG } from '@/constants/config';

class SmsReporter {
  async send(phone: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${CONFIG.BACKEND_API_URL}/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message: message.slice(0, 160) }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async sendWeeklySummary(phone: string, childName: string, score: number, blockedCount: number): Promise<boolean> {
    const message = `ShieldAI Family: ${childName}'s weekly safety score: ${score}/100. Blocked: ${blockedCount}. Open app for details.`;
    return this.send(phone, message);
  }
}

export const smsReporter = new SmsReporter();
