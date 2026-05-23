import { useActivityStore } from '@/store/activityStore';

export function useAlerts(options?: { limit?: number }) {
  const { activities } = useActivityStore();
  const alerts = activities.filter((a) => a.verdict === 'flagged' || a.verdict === 'blocked');
  const limited = options?.limit ? alerts.slice(0, options.limit) : alerts;

  return {
    alerts: limited,
    isLoading: false,
    refetch: () => {},
    getAlertById: (id: string) => alerts.find((a) => a.id === id) ?? null,
  };
}
