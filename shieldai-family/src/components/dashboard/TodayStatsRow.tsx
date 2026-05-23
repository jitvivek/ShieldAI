import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from '@/components/common/Card';

interface TodayStatsRowProps {
  stats: {
    totalToday: number;
    safeToday: number;
    flaggedToday: number;
    blockedToday: number;
  } | null;
}

export default function TodayStatsRow({ stats }: TodayStatsRowProps) {
  const { t } = useTranslation();

  const items = [
    { label: t('dashboard.total'), value: stats?.totalToday ?? 0, color: 'text-gray-900' },
    { label: t('dashboard.safe'), value: stats?.safeToday ?? 0, color: 'text-safe' },
    { label: t('dashboard.flagged'), value: stats?.flaggedToday ?? 0, color: 'text-warning' },
    { label: t('dashboard.blocked'), value: stats?.blockedToday ?? 0, color: 'text-danger' },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
      {items.map((item) => (
        <Card key={item.label} className="mr-3 w-24 items-center">
          <Text className={`text-2xl font-mono font-bold ${item.color}`}>{item.value}</Text>
          <Text className="text-xs font-body text-gray-500 mt-1">{item.label}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
