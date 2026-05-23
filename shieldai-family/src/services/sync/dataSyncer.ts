import { CONFIG } from '@/constants/config';
import { useActivityStore } from '@/store/activityStore';

class DataSyncer {
  async syncActivities(): Promise<void> {
    const { activities, getUnsyncedActivities, markAsSynced } = useActivityStore.getState();
    const unsynced = getUnsyncedActivities();

    if (unsynced.length === 0) return;

    try {
      const response = await fetch(`${CONFIG.BACKEND_API_URL}/activity/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: unsynced }),
      });

      if (response.ok) {
        markAsSynced(unsynced.map((a) => a.id));
      }
    } catch {
      // Will retry on next sync cycle
    }
  }

  async fetchParentActivities(childId: string, page: number = 1): Promise<any[]> {
    try {
      const response = await fetch(
        `${CONFIG.BACKEND_API_URL}/activity?childId=${childId}&page=${page}&limit=20`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.activities ?? [];
    } catch {
      return [];
    }
  }
}

export const dataSyncer = new DataSyncer();
