import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAlerts } from '@/hooks/useAlerts';
import ActivityItem from '@/components/activity/ActivityItem';
import EmptyState from '@/components/common/EmptyState';

export default function Alerts() {
  const { t } = useTranslation();
  const router = useRouter();
  const { alerts, isLoading, refetch } = useAlerts();

  return (
    <View className="flex-1 bg-white pt-14">
      <View className="px-5 pb-3">
        <Text className="text-2xl font-heading font-bold text-gray-900">
          {t('alerts.title')}
        </Text>
        <Text className="text-sm font-body text-gray-500 mt-1">
          {t('alerts.subtitle')}
        </Text>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityItem
            activity={item}
            onPress={() => router.push(`/(parent)/alerts/${item.id}`)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ListEmptyComponent={
          <EmptyState
            title={t('alerts.emptyTitle')}
            description={t('alerts.emptyDesc')}
          />
        }
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      />
    </View>
  );
}
