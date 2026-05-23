import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/settingsStore';
import PiiTypeGrid from '@/components/controls/PiiTypeGrid';

export default function PiiProtection() {
  const { t } = useTranslation();
  const { piiSettings, togglePiiType } = useSettingsStore();

  return (
    <ScrollView className="flex-1 bg-white pt-14 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
      <Text className="text-2xl font-heading font-bold text-gray-900 mb-2">
        {t('controls.piiProtection')}
      </Text>
      <Text className="text-sm font-body text-gray-500 mb-6">
        {t('controls.piiProtectionLong')}
      </Text>

      <PiiTypeGrid settings={piiSettings} onToggle={togglePiiType} />
    </ScrollView>
  );
}
