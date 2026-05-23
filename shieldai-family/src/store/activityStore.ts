import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { hashSha256 } from '@/utils/crypto';

const storage = new MMKV({ id: 'activity-store' });

interface Activity {
  id: string;
  appName: string;
  appPackage: string;
  textPreview: string;
  direction: 'input' | 'response';
  verdict: string;
  riskScore: number;
  category: string | null;
  language: string | null;
  piiDetected: any;
  scanSource: string;
  createdAt: string;
  synced: boolean;
}

interface ActivityState {
  activities: Activity[];
  addActivity: (data: Omit<Activity, 'id' | 'synced'>) => void;
  getUnsyncedActivities: () => Activity[];
  markAsSynced: (ids: string[]) => void;
  clearAll: () => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: (() => {
    const raw = storage.getString('activities');
    return raw ? JSON.parse(raw) : [];
  })(),

  addActivity: (data) => {
    const activity: Activity = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      synced: false,
    };
    const { activities } = get();
    const updated = [activity, ...activities].slice(0, 500); // Keep max 500 local
    storage.set('activities', JSON.stringify(updated));
    set({ activities: updated });
  },

  getUnsyncedActivities: () => {
    return get().activities.filter((a) => !a.synced);
  },

  markAsSynced: (ids) => {
    const { activities } = get();
    const updated = activities.map((a) => (ids.includes(a.id) ? { ...a, synced: true } : a));
    storage.set('activities', JSON.stringify(updated));
    set({ activities: updated });
  },

  clearAll: () => {
    storage.delete('activities');
    set({ activities: [] });
  },
}));
