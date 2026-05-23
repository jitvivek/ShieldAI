import { View, Text, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/common/Badge';
import AppIcon from '@/components/activity/AppIcon';
import { formatRelativeTime } from '@/utils/formatters';

interface Alert {
  id: string;
  appName: string;
  textPreview: string;
  verdict: string;
  category: string;
  createdAt: string;
}

interface RecentAlertsListProps {
  alerts: Alert[];
}

export default function RecentAlertsList({ alerts }: RecentAlertsListProps) {
  const { t } = useTranslation();
  const router = useRouter();

  if (!alerts.length) {
    return (
      <View className="bg-green-50 rounded-xl p-4 items-center">
        <Text className="text-safe font-heading font-medium">{t('dashboard.allClear')}</Text>
      </View>
    );
  }

  return (
    <View>
      {alerts.map((alert) => (
        <Pressable
          key={alert.id}
          onPress={() => router.push(`/(parent)/alerts/${alert.id}`)}
          className="flex-row items-center py-3 border-b border-gray-100"
        >
          <AppIcon appName={alert.appName} size={32} />
          <View className="flex-1 ml-3">
            <Text className="text-sm font-body text-gray-900" numberOfLines={1}>
              {alert.textPreview}
            </Text>
            <Text className="text-xs font-body text-gray-500 mt-0.5">
              {alert.appName} · {formatRelativeTime(alert.createdAt)}
            </Text>
          </View>
          <Badge
            variant={alert.verdict === 'blocked' ? 'blocked' : 'warning'}
            label={alert.verdict === 'blocked' ? t('common.blocked') : t('common.flagged')}
          />
        </Pressable>
      ))}
    </View>
  );
}
