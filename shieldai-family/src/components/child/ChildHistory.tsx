import { View, FlatList, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/common/Badge';
import { formatRelativeTime } from '@/utils/formatters';

interface Activity {
  id: string;
  appName: string;
  verdict: string;
  createdAt: string;
}

interface ChildHistoryProps {
  activities: Activity[];
  emptyComponent: React.ReactElement;
}

export default function ChildHistory({ activities, emptyComponent }: ChildHistoryProps) {
  const { t } = useTranslation();

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={emptyComponent}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      renderItem={({ item }) => (
        <View className="flex-row items-center py-3 border-b border-gray-100">
          <View className="flex-1">
            <Text className="text-sm font-body text-gray-700">{item.appName}</Text>
            <Text className="text-xs font-body text-gray-400 mt-0.5">
              {formatRelativeTime(item.createdAt)}
            </Text>
          </View>
          <Badge
            variant={item.verdict === 'blocked' ? 'blocked' : item.verdict === 'flagged' ? 'warning' : 'safe'}
            label={item.verdict === 'safe' ? '✓' : item.verdict === 'flagged' ? '⚠' : '✕'}
          />
        </View>
      )}
    />
  );
}
