import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import ActivityFeed from '@/components/activity/ActivityFeed';
import { useActivity } from '@/hooks/useActivity';

export default function Activity() {
  const { t } = useTranslation();
  const { activities, fetchNextPage, hasNextPage, isLoading, refetch } = useActivity();

  return (
    <View className="flex-1 bg-white pt-14">
      <View className="px-5 pb-3">
        <Text className="text-2xl font-heading font-bold text-gray-900">
          {t('activity.title')}
        </Text>
      </View>
      <ActivityFeed
        activities={activities}
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage}
        isLoading={isLoading}
        onRefresh={refetch}
      />
    </View>
  );
}
