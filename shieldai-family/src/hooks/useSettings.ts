import { useSettingsStore } from '@/store/settingsStore';

export function useSettings() {
  const store = useSettingsStore();
  return store;
}
