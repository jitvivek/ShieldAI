import { create } from 'zustand';
import type { DailyStats, ScanHistoryItem } from '../shared/types';

interface PopupState {
  stats: DailyStats;
  history: ScanHistoryItem[];
  isOnline: boolean;
  setStats: (stats: DailyStats) => void;
  setHistory: (history: ScanHistoryItem[]) => void;
  setOnline: (online: boolean) => void;
}

export const usePopupStore = create<PopupState>((set) => ({
  stats: {
    date: new Date().toISOString().split('T')[0],
    scansToday: 0,
    blocked: 0,
    piiCaught: 0,
    languagesDetected: [],
  },
  history: [],
  isOnline: true,
  setStats: (stats) => set({ stats }),
  setHistory: (history) => set({ history }),
  setOnline: (isOnline) => set({ isOnline }),
}));
