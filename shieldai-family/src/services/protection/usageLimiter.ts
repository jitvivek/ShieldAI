import { MMKV } from 'react-native-mmkv';
import { useSettingsStore } from '@/store/settingsStore';

const storage = new MMKV({ id: 'usage-limiter' });

class UsageLimiter {
  private getTodayKey(): string {
    return `usage_${new Date().toISOString().slice(0, 10)}`;
  }

  trackUsage(timestamp: number): void {
    const key = this.getTodayKey();
    const current = storage.getNumber(key) ?? 0;
    storage.set(key, current + 1);

    // Track time spent (in seconds, increment by debounce interval)
    const timeKey = `time_${this.getTodayKey()}`;
    const currentTime = storage.getNumber(timeKey) ?? 0;
    storage.set(timeKey, currentTime + 5); // 5 second intervals
  }

  isLimitExceeded(): boolean {
    const { dailyLimitMins } = useSettingsStore.getState();
    const timeKey = `time_${this.getTodayKey()}`;
    const usedSeconds = storage.getNumber(timeKey) ?? 0;
    return usedSeconds >= dailyLimitMins * 60;
  }

  getTodayUsageMinutes(): number {
    const timeKey = `time_${this.getTodayKey()}`;
    const usedSeconds = storage.getNumber(timeKey) ?? 0;
    return Math.floor(usedSeconds / 60);
  }

  getRemainingMinutes(): number {
    const { dailyLimitMins } = useSettingsStore.getState();
    return Math.max(0, dailyLimitMins - this.getTodayUsageMinutes());
  }

  resetDaily(): void {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const key = `usage_${yesterday.toISOString().slice(0, 10)}`;
    const timeKey = `time_${yesterday.toISOString().slice(0, 10)}`;
    storage.delete(key);
    storage.delete(timeKey);
  }
}

export const usageLimiter = new UsageLimiter();
