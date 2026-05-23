import { FlatList, RefreshControl } from 'react-native';
import ActivityItem from './ActivityItem';
import EmptyState from '@/components/common/EmptyState';
import { useTranslation } from 'react-i18next';

interface Activity {
  id: string;
  appName: string;
  textPreview: string;
  verdict: string;
  category: string | null;
  language: string | null;
  riskScore: number;
  createdAt: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ActivityFeed({ activities, onLoadMore, hasMore, isLoading, onRefresh }: ActivityFeedProps) {
  const { t } = useTranslation();

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ActivityItem activity={item} />}
      onEndReached={hasMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.5}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      ListEmptyComponent={
        <EmptyState title={t('activity.emptyTitle')} description={t('activity.emptyDesc')} />
      }
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    />
  );
}
