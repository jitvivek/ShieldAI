import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'settings-store' });

interface PiiSettings {
  aadhaar: boolean;
  pan: boolean;
  upiId: boolean;
  indianPhone: boolean;
  email: boolean;
  schoolName: boolean;
  homeAddress: boolean;
  parentName: boolean;
}

interface SettingsState {
  ageTier: string;
  sensitivity: 'permissive' | 'balanced' | 'strict';
  blockedCategories: string[];
  dailyLimitMins: number;
  bedtimeStart: string;
  bedtimeEnd: string;
  bedtimeEnabled: boolean;
  appRules: Record<string, 'monitor' | 'block' | 'allow'>;
  customKeywords: string[];
  piiSettings: PiiSettings;
  setAgeTier: (tier: string) => void;
  setSensitivity: (s: 'permissive' | 'balanced' | 'strict') => void;
  toggleCategory: (cat: string) => void;
  setDailyLimit: (mins: number) => void;
  setBedtime: (start: string, end: string) => void;
  setAppRule: (pkg: string, rule: 'monitor' | 'block' | 'allow') => void;
  addKeyword: (kw: string) => void;
  removeKeyword: (kw: string) => void;
  togglePiiType: (key: keyof PiiSettings) => void;
}

const defaultPii: PiiSettings = {
  aadhaar: true,
  pan: true,
  upiId: true,
  indianPhone: true,
  email: true,
  schoolName: true,
  homeAddress: true,
  parentName: true,
};

const loadJson = <T>(key: string, fallback: T): T => {
  const raw = storage.getString(key);
  return raw ? JSON.parse(raw) : fallback;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ageTier: storage.getString('ageTier') ?? 'teen',
  sensitivity: (storage.getString('sensitivity') as any) ?? 'balanced',
  blockedCategories: loadJson('blockedCategories', ['violence', 'weapons', 'drugs', 'explicit_content', 'self_harm']),
  dailyLimitMins: storage.getNumber('dailyLimitMins') ?? 60,
  bedtimeStart: storage.getString('bedtimeStart') ?? '21:00',
  bedtimeEnd: storage.getString('bedtimeEnd') ?? '06:00',
  bedtimeEnabled: storage.getBoolean('bedtimeEnabled') ?? true,
  appRules: loadJson('appRules', {}),
  customKeywords: loadJson('customKeywords', []),
  piiSettings: loadJson('piiSettings', defaultPii),

  setAgeTier: (tier) => {
    storage.set('ageTier', tier);
    set({ ageTier: tier });
  },
  setSensitivity: (s) => {
    storage.set('sensitivity', s);
    set({ sensitivity: s });
  },
  toggleCategory: (cat) => {
    const { blockedCategories } = get();
    const updated = blockedCategories.includes(cat)
      ? blockedCategories.filter((c) => c !== cat)
      : [...blockedCategories, cat];
    storage.set('blockedCategories', JSON.stringify(updated));
    set({ blockedCategories: updated });
  },
  setDailyLimit: (mins) => {
    storage.set('dailyLimitMins', mins);
    set({ dailyLimitMins: mins });
  },
  setBedtime: (start, end) => {
    storage.set('bedtimeStart', start);
    storage.set('bedtimeEnd', end);
    set({ bedtimeStart: start, bedtimeEnd: end });
  },
  setAppRule: (pkg, rule) => {
    const { appRules } = get();
    const updated = { ...appRules, [pkg]: rule };
    storage.set('appRules', JSON.stringify(updated));
    set({ appRules: updated });
  },
  addKeyword: (kw) => {
    const { customKeywords } = get();
    const updated = [...customKeywords, kw];
    storage.set('customKeywords', JSON.stringify(updated));
    set({ customKeywords: updated });
  },
  removeKeyword: (kw) => {
    const { customKeywords } = get();
    const updated = customKeywords.filter((k) => k !== kw);
    storage.set('customKeywords', JSON.stringify(updated));
    set({ customKeywords: updated });
  },
  togglePiiType: (key) => {
    const { piiSettings } = get();
    const updated = { ...piiSettings, [key]: !piiSettings[key] };
    storage.set('piiSettings', JSON.stringify(updated));
    set({ piiSettings: updated });
  },
}));
