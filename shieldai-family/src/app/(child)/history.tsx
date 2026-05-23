import { View, Text, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useActivity } from '@/hooks/useActivity';
import ChildHistory from '@/components/child/ChildHistory';
import EmptyState from '@/components/common/EmptyState';

export default function History() {
  const { t } = useTranslation();
  const { activities } = useActivity();

  return (
    <View className="flex-1 bg-white pt-14">
      <View className="px-5 pb-3">
        <Text className="text-xl font-heading font-bold text-gray-900">
          {t('child.historyTitle')}
        </Text>
      </View>

      <ChildHistory
        activities={activities.slice(0, 20)}
        emptyComponent={
          <EmptyState
            title={t('child.noHistory')}
            description={t('child.noHistoryDesc')}
          />
        }
      />
    </View>
  );
}
