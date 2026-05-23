import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'subscription-store' });

interface SubscriptionState {
  planId: string;
  planExpiresAt: string | null;
  connectedDevices: number;
  setPlan: (planId: string, expiresAt?: string) => void;
  setDeviceCount: (count: number) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  planId: storage.getString('planId') ?? 'free',
  planExpiresAt: storage.getString('planExpiresAt') ?? null,
  connectedDevices: storage.getNumber('connectedDevices') ?? 1,

  setPlan: (planId, expiresAt) => {
    storage.set('planId', planId);
    if (expiresAt) storage.set('planExpiresAt', expiresAt);
    set({ planId, planExpiresAt: expiresAt ?? null });
  },

  setDeviceCount: (count) => {
    storage.set('connectedDevices', count);
    set({ connectedDevices: count });
  },
}));
