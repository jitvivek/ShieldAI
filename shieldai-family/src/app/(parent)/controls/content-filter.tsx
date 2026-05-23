import { View, Text, ScrollView, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/settingsStore';
import SensitivitySlider from '@/components/controls/SensitivitySlider';
import CategoryToggle from '@/components/controls/CategoryToggle';

const CATEGORIES = [
  'violence', 'weapons', 'drugs', 'alcohol', 'explicit_content',
  'self_harm', 'gambling', 'dating', 'horror', 'dark_humor',
  'political_extremism', 'religious_hate', 'caste_discrimination',
  'body_shaming', 'cyberbullying', 'personal_safety',
];

export default function ContentFilter() {
  const { t } = useTranslation();
  const { blockedCategories, toggleCategory, sensitivity, setSensitivity } = useSettingsStore();

  return (
    <ScrollView className="flex-1 bg-white pt-14 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
      <Text className="text-2xl font-heading font-bold text-gray-900 mb-2">
        {t('controls.contentFilter')}
      </Text>
      <Text className="text-sm font-body text-gray-500 mb-6">
        {t('controls.contentFilterLong')}
      </Text>

      <View className="mb-6">
        <Text className="text-base font-heading font-medium text-gray-900 mb-3">
          {t('controls.sensitivity')}
        </Text>
        <SensitivitySlider value={sensitivity} onChange={setSensitivity} />
      </View>

      <Text className="text-base font-heading font-medium text-gray-900 mb-3">
        {t('controls.blockedCategories')}
      </Text>
      {CATEGORIES.map((cat) => (
        <CategoryToggle
          key={cat}
          category={cat}
          enabled={blockedCategories.includes(cat)}
          onToggle={() => toggleCategory(cat)}
        />
      ))}
    </ScrollView>
  );
}
