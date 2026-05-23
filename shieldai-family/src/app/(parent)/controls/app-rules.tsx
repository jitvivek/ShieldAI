import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/settingsStore';
import AppRuleCard from '@/components/controls/AppRuleCard';
import { AI_APPS } from '@/utils/aiAppRegistry';

export default function AppRules() {
  const { t } = useTranslation();
  const { appRules, setAppRule } = useSettingsStore();

  return (
    <ScrollView className="flex-1 bg-white pt-14 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
      <Text className="text-2xl font-heading font-bold text-gray-900 mb-2">
        {t('controls.appRules')}
      </Text>
      <Text className="text-sm font-body text-gray-500 mb-6">
        {t('controls.appRulesLong')}
      </Text>

      {AI_APPS.map((app) => (
        <AppRuleCard
          key={app.packageName}
          app={app}
          rule={appRules[app.packageName] ?? 'monitor'}
          onRuleChange={(rule) => setAppRule(app.packageName, rule)}
        />
      ))}
    </ScrollView>
  );
}
