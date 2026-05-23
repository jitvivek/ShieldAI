import { useActivityStore } from '@/store/activityStore';

export function useActivity() {
  const { activities } = useActivityStore();

  return {
    activities,
    fetchNextPage: () => {},
    hasNextPage: false,
    isLoading: false,
    refetch: () => {},
    getActivityById: (id: string) => activities.find((a) => a.id === id) ?? null,
  };
}
