import { useSettingsStore } from '@/store/settingsStore';

class AppBlocker {
  isBlocked(packageName: string): boolean {
    const { appRules } = useSettingsStore.getState();
    return appRules[packageName] === 'block';
  }

  getBlockedApps(): string[] {
    const { appRules } = useSettingsStore.getState();
    return Object.entries(appRules)
      .filter(([, rule]) => rule === 'block')
      .map(([pkg]) => pkg);
  }
}

export const appBlocker = new AppBlocker();
