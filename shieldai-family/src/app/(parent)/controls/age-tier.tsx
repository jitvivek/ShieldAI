import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/settingsStore';
import AgeTierSelector from '@/components/controls/AgeTierSelector';

export default function AgeTier() {
  const { t } = useTranslation();
  const { ageTier, setAgeTier } = useSettingsStore();

  return (
    <ScrollView className="flex-1 bg-white pt-14 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
      <Text className="text-2xl font-heading font-bold text-gray-900 mb-2">
        {t('controls.ageTier')}
      </Text>
      <Text className="text-sm font-body text-gray-500 mb-6">
        {t('controls.ageTierLong')}
      </Text>

      <AgeTierSelector selected={ageTier} onSelect={setAgeTier} />
    </ScrollView>
  );
}
