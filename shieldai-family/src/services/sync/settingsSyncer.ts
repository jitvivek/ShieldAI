import { CONFIG } from '@/constants/config';

class SettingsSyncer {
  async pushSettings(childId: string, settings: any): Promise<boolean> {
    try {
      const response = await fetch(`${CONFIG.BACKEND_API_URL}/settings/${childId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async pullSettings(childId: string): Promise<any | null> {
    try {
      const response = await fetch(`${CONFIG.BACKEND_API_URL}/settings/${childId}`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }
}

export const settingsSyncer = new SettingsSyncer();
