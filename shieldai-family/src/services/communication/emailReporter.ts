import { CONFIG } from '@/constants/config';

class EmailReporter {
  async sendReport(email: string, reportHtml: string, subject: string): Promise<boolean> {
    try {
      const response = await fetch(`${CONFIG.BACKEND_API_URL}/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject, html: reportHtml }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const emailReporter = new EmailReporter();
