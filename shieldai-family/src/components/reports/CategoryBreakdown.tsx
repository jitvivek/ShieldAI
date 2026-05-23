import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from '@/components/common/Card';

interface CategoryBreakdownProps {
  data: Record<string, number>;
}

const CATEGORY_COLORS: Record<string, string> = {
  violence: '#EF4444',
  explicit_content: '#DC2626',
  self_harm: '#B91C1C',
  cyberbullying: '#F97316',
  personal_safety: '#EA580C',
  pii_detected: '#D97706',
  drugs: '#7C3AED',
  weapons: '#6D28D9',
};

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const { t } = useTranslation();
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1;

  return (
    <Card className="mb-4">
      <Text className="text-base font-heading font-medium text-gray-900 mb-3">
        {t('reports.categoryBreakdown')}
      </Text>
      {entries.map(([category, count]) => (
        <View key={category} className="mb-2">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs font-body text-gray-700">{t(`categories.${category}`)}</Text>
            <Text className="text-xs font-mono text-gray-500">{count}</Text>
          </View>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${(count / total) * 100}%`,
                backgroundColor: CATEGORY_COLORS[category] || '#64748B',
              }}
            />
          </View>
        </View>
      ))}
    </Card>
  );
}
