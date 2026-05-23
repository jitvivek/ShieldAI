import { useActivityStore } from '@/store/activityStore';
import { usageLimiter } from '@/services/protection/usageLimiter';

export function useScanStats() {
  const { activities } = useActivityStore();
  const today = new Date().toISOString().slice(0, 10);
  const todayActivities = activities.filter((a) => a.createdAt.startsWith(today));

  const stats = {
    totalToday: todayActivities.length,
    safeToday: todayActivities.filter((a) => a.verdict === 'safe').length,
    flaggedToday: todayActivities.filter((a) => a.verdict === 'flagged').length,
    blockedToday: todayActivities.filter((a) => a.verdict === 'blocked').length,
    safetyScore: todayActivities.length === 0 ? 100 :
      Math.round((todayActivities.filter((a) => a.verdict === 'safe').length / todayActivities.length) * 100),
    usageMinutes: usageLimiter.getTodayUsageMinutes(),
    weeklyData: [0, 0, 0, 0, 0, 0, 0] as number[],
  };

  return { stats, refetch: () => {}, isLoading: false };
}
