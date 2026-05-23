import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'child-store' });

interface Child {
  id: string;
  name: string;
  age: number;
  ageTier: string;
  deviceId?: string;
  platform?: string;
  protectionActive: boolean;
}

interface ChildState {
  children: Child[];
  activeChildId: string | null;
  addChild: (data: { name: string; age: number; ageTier: string }) => Promise<void>;
  removeChild: (id: string) => void;
  setActiveChild: (id: string) => void;
}

export const useChildStore = create<ChildState>((set, get) => ({
  children: (() => {
    const raw = storage.getString('children');
    return raw ? JSON.parse(raw) : [];
  })(),
  activeChildId: storage.getString('activeChildId') ?? null,

  addChild: async (data) => {
    const child: Child = {
      id: `child-${Date.now()}`,
      ...data,
      protectionActive: true,
    };
    const { children } = get();
    const updated = [...children, child];
    storage.set('children', JSON.stringify(updated));
    storage.set('activeChildId', child.id);
    set({ children: updated, activeChildId: child.id });
  },

  removeChild: (id) => {
    const { children, activeChildId } = get();
    const updated = children.filter((c) => c.id !== id);
    storage.set('children', JSON.stringify(updated));
    if (activeChildId === id) {
      const newActive = updated[0]?.id ?? null;
      storage.set('activeChildId', newActive ?? '');
      set({ children: updated, activeChildId: newActive });
    } else {
      set({ children: updated });
    }
  },

  setActiveChild: (id) => {
    storage.set('activeChildId', id);
    set({ activeChildId: id });
  },
}));
