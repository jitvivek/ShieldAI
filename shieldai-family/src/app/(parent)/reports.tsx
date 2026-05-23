import { View, Text, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useReports } from '@/hooks/useReports';
import WeeklyReportCard from '@/components/reports/WeeklyReportCard';
import EmptyState from '@/components/common/EmptyState';

export default function Reports() {
  const { t } = useTranslation();
  const router = useRouter();
  const { reports, isLoading } = useReports();

  return (
    <View className="flex-1 bg-white pt-14">
      <View className="px-5 pb-3">
        <Text className="text-2xl font-heading font-bold text-gray-900">
          {t('reports.title')}
        </Text>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WeeklyReportCard
            report={item}
            onPress={() => router.push('/(parent)/reports/weekly')}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ListEmptyComponent={
          <EmptyState
            title={t('reports.emptyTitle')}
            description={t('reports.emptyDesc')}
          />
        }
      />
    </View>
  );
}
