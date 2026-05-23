import { useSettingsStore } from '@/store/settingsStore';

class NightMode {
  isBlockedNow(): boolean {
    const { bedtimeStart, bedtimeEnd, bedtimeEnabled } = useSettingsStore.getState();
    if (!bedtimeEnabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = bedtimeStart.split(':').map(Number);
    const [endH, endM] = bedtimeEnd.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes < endMinutes) {
      // Same day range (e.g., 21:00 - 23:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Crosses midnight (e.g., 21:00 - 06:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  }
}

export const nightMode = new NightMode();
