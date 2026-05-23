import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from '@/components/common/Card';

export default function SafetyTrend() {
  const { t } = useTranslation();

  return (
    <Card className="mb-4">
      <Text className="text-base font-heading font-medium text-gray-900 mb-2">
        {t('reports.safetyTrend')}
      </Text>
      <Text className="text-sm font-body text-gray-500">
        {t('reports.safetyTrendDesc')}
      </Text>
    </Card>
  );
}
