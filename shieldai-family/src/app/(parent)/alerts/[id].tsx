import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import ActivityDetail from '@/components/activity/ActivityDetail';
import { useAlerts } from '@/hooks/useAlerts';

export default function AlertDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { getAlertById } = useAlerts();
  const alert = getAlertById(id);

  if (!alert) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500 font-body">{t('alerts.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white pt-14 px-5">
      <Text className="text-2xl font-heading font-bold text-gray-900 mb-4">
        {t('alerts.detailTitle')}
      </Text>
      <ActivityDetail activity={alert} />
    </ScrollView>
  );
}
