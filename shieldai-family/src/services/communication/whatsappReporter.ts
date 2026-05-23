import { CONFIG } from '@/constants/config';

class WhatsappReporter {
  async sendWeeklyReport(phone: string, reportData: {
    childName: string;
    dateRange: string;
    total: number;
    safeCount: number;
    flaggedCount: number;
    blockedCount: number;
    totalTime: string;
    safetyScore: number;
  }): Promise<boolean> {
    const safePct = reportData.total > 0
      ? Math.round((reportData.safeCount / reportData.total) * 100)
      : 100;

    const scoreLabel = reportData.safetyScore >= 80 ? 'Excellent' :
      reportData.safetyScore >= 60 ? 'Good' :
      reportData.safetyScore >= 40 ? 'Needs attention' : 'Critical';

    const message = `🛡️ *ShieldAI Family — Weekly Report*
Child: ${reportData.childName} | ${reportData.dateRange}

📊 *Summary*
• AI interactions: ${reportData.total}
• Safe: ${reportData.safeCount} (${safePct}%)
• Flagged: ${reportData.flaggedCount}
• Blocked: ${reportData.blockedCount}
• AI time: ${reportData.totalTime}

🏆 Safety score: ${reportData.safetyScore}/100 — ${scoreLabel}

📱 Open ShieldAI Family app for full details`;

    try {
      const response = await fetch(`${CONFIG.BACKEND_API_URL}/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const whatsappReporter = new WhatsappReporter();
