import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from '@/components/common/Card';

interface TopConcernsProps {
  flaggedCount: number;
  blockedCount: number;
}

export default function TopConcerns({ flaggedCount, blockedCount }: TopConcernsProps) {
  const { t } = useTranslation();

  return (
    <Card className="mb-4">
      <Text className="text-base font-heading font-medium text-gray-900 mb-3">
        {t('reports.topConcerns')}
      </Text>
      <View className="flex-row">
        <View className="flex-1 items-center py-3 bg-amber-50 rounded-lg mr-2">
          <Text className="text-2xl font-mono font-bold text-warning">{flaggedCount}</Text>
          <Text className="text-xs font-body text-amber-700">{t('common.flagged')}</Text>
        </View>
        <View className="flex-1 items-center py-3 bg-red-50 rounded-lg ml-2">
          <Text className="text-2xl font-mono font-bold text-danger">{blockedCount}</Text>
          <Text className="text-xs font-body text-red-700">{t('common.blocked')}</Text>
        </View>
      </View>
    </Card>
  );
}
