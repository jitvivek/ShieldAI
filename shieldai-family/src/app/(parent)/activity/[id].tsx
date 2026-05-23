import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import ActivityDetail from '@/components/activity/ActivityDetail';
import { useActivity } from '@/hooks/useActivity';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { getActivityById } = useActivity();
  const activity = getActivityById(id);

  if (!activity) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500 font-body">{t('activity.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white pt-14 px-5">
      <Text className="text-2xl font-heading font-bold text-gray-900 mb-4">
        {t('activity.detailTitle')}
      </Text>
      <ActivityDetail activity={activity} />
    </ScrollView>
  );
}
