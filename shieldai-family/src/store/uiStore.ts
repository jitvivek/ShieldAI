import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'ui-store' });

interface UiState {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi';
  onboardingComplete: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  completeOnboarding: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: (storage.getString('theme') as any) ?? 'system',
  language: (storage.getString('language') as any) ?? 'en',
  onboardingComplete: storage.getBoolean('onboardingComplete') ?? false,

  setTheme: (theme) => {
    storage.set('theme', theme);
    set({ theme });
  },
  setLanguage: (lang) => {
    storage.set('language', lang);
    set({ language: lang });
  },
  completeOnboarding: () => {
    storage.set('onboardingComplete', true);
    set({ onboardingComplete: true });
  },
}));
