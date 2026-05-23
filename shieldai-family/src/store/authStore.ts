import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'auth-store' });

interface User {
  uid: string;
  phone: string;
  name?: string;
  email?: string;
  isNewUser: boolean;
  childName?: string;
  childId?: string;
  parentPhone?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  userMode: 'parent' | 'child';
  setUser: (user: User) => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  setMode: (mode: 'parent' | 'child') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: storage.getBoolean('isAuthenticated') ?? false,
  isLoading: false,
  user: (() => {
    const raw = storage.getString('user');
    return raw ? JSON.parse(raw) : null;
  })(),
  userMode: (storage.getString('userMode') as 'parent' | 'child') ?? 'parent',

  setUser: (user) => {
    storage.set('isAuthenticated', true);
    storage.set('user', JSON.stringify(user));
    set({ isAuthenticated: true, user });
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;
    const updated = { ...user, ...data };
    storage.set('user', JSON.stringify(updated));
    set({ user: updated });
  },

  setMode: (mode) => {
    storage.set('userMode', mode);
    set({ userMode: mode });
  },

  logout: () => {
    storage.delete('isAuthenticated');
    storage.delete('user');
    storage.delete('userMode');
    set({ isAuthenticated: false, user: null, userMode: 'parent' });
  },
}));
