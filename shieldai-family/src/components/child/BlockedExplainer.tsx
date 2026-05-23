import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function BlockedExplainer() {
  const { t } = useTranslation();

  return (
    <View className="bg-red-50 rounded-xl p-5 mt-6 mx-4">
      <Text className="text-base font-heading font-medium text-red-900 mb-2">
        {t('child.blockedExplainTitle')}
      </Text>
      <Text className="text-sm font-body text-red-700 leading-5">
        {t('child.blockedExplainBody')}
      </Text>
    </View>
  );
}
