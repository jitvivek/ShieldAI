import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/settingsStore';
import TimeLimitPicker from '@/components/controls/TimeLimitPicker';

export default function TimeLimits() {
  const { t } = useTranslation();
  const { dailyLimitMins, setDailyLimit, bedtimeStart, bedtimeEnd, setBedtime } = useSettingsStore();

  return (
    <ScrollView className="flex-1 bg-white pt-14 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
      <Text className="text-2xl font-heading font-bold text-gray-900 mb-2">
        {t('controls.timeLimits')}
      </Text>
      <Text className="text-sm font-body text-gray-500 mb-6">
        {t('controls.timeLimitsLong')}
      </Text>

      <View className="mb-8">
        <Text className="text-base font-heading font-medium text-gray-900 mb-3">
          {t('controls.dailyLimit')}
        </Text>
        <TimeLimitPicker value={dailyLimitMins} onChange={setDailyLimit} />
        <Text className="text-sm font-body text-gray-500 mt-2 text-center">
          {dailyLimitMins} {t('controls.minutesPerDay')}
        </Text>
      </View>

      <View>
        <Text className="text-base font-heading font-medium text-gray-900 mb-3">
          {t('controls.bedtimeBlock')}
        </Text>
        <View className="flex-row justify-between">
          <View className="flex-1 mr-2 bg-surface-light rounded-xl p-4">
            <Text className="text-sm font-body text-gray-500">{t('controls.from')}</Text>
            <Text className="text-xl font-mono font-bold text-gray-900">{bedtimeStart}</Text>
          </View>
          <View className="flex-1 ml-2 bg-surface-light rounded-xl p-4">
            <Text className="text-sm font-body text-gray-500">{t('controls.to')}</Text>
            <Text className="text-xl font-mono font-bold text-gray-900">{bedtimeEnd}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
