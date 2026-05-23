import { AGE_TIERS } from '@/utils/ageFilters';
import { useSettingsStore } from '@/store/settingsStore';

class AgeFilter {
  isContentAllowed(category: string): boolean {
    const { ageTier } = useSettingsStore.getState();
    const tier = AGE_TIERS.find((t) => t.id === ageTier);
    if (!tier) return true;
    return !tier.blockedCategories.includes(category);
  }

  getBlockedCategories(): string[] {
    const { ageTier } = useSettingsStore.getState();
    const tier = AGE_TIERS.find((t) => t.id === ageTier);
    return tier?.blockedCategories ?? [];
  }

  getDailyLimit(): number {
    const { ageTier } = useSettingsStore.getState();
    const tier = AGE_TIERS.find((t) => t.id === ageTier);
    return tier?.maxDailyMinutes ?? 60;
  }
}

export const ageFilter = new AgeFilter();
