import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import AppIcon from './AppIcon';
import { formatDateTime } from '@/utils/formatters';

interface Activity {
  id: string;
  appName: string;
  textPreview: string;
  verdict: string;
  category: string | null;
  language: string | null;
  riskScore: number;
  createdAt: string;
  piiDetected?: any;
  scanSource?: string;
}

interface ActivityDetailProps {
  activity: Activity;
}

export default function ActivityDetail({ activity }: ActivityDetailProps) {
  const { t } = useTranslation();

  return (
    <View>
      <Card className="mb-4">
        <View className="flex-row items-center mb-3">
          <AppIcon appName={activity.appName} size={40} />
          <View className="ml-3">
            <Text className="text-base font-heading font-medium text-gray-900">{activity.appName}</Text>
            <Text className="text-xs font-body text-gray-500">{formatDateTime(activity.createdAt)}</Text>
          </View>
          <View className="ml-auto">
            <Badge
              variant={activity.verdict === 'blocked' ? 'blocked' : activity.verdict === 'flagged' ? 'warning' : 'safe'}
              label={activity.verdict}
            />
          </View>
        </View>

        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <Text className="text-sm font-body text-gray-800">{activity.textPreview}</Text>
        </View>

        <View className="flex-row flex-wrap">
          <View className="mr-6 mb-2">
            <Text className="text-xs font-body text-gray-500">{t('activity.riskScore')}</Text>
            <Text className="text-lg font-mono font-bold text-gray-900">{(activity.riskScore * 100).toFixed(0)}%</Text>
          </View>
          {activity.category && (
            <View className="mr-6 mb-2">
              <Text className="text-xs font-body text-gray-500">{t('activity.category')}</Text>
              <Text className="text-sm font-body text-gray-900">{activity.category}</Text>
            </View>
          )}
          {activity.language && (
            <View className="mr-6 mb-2">
              <Text className="text-xs font-body text-gray-500">{t('activity.language')}</Text>
              <Text className="text-sm font-body text-gray-900">{activity.language}</Text>
            </View>
          )}
          {activity.scanSource && (
            <View className="mb-2">
              <Text className="text-xs font-body text-gray-500">{t('activity.scanSource')}</Text>
              <Text className="text-sm font-body text-gray-900">{activity.scanSource}</Text>
            </View>
          )}
        </View>
      </Card>

      {activity.piiDetected && (
        <Card className="mb-4">
          <Text className="text-base font-heading font-medium text-gray-900 mb-2">
            {t('activity.piiDetected')}
          </Text>
          {Array.isArray(activity.piiDetected) &&
            activity.piiDetected.map((pii: any, idx: number) => (
              <View key={idx} className="flex-row items-center py-1">
                <View className="w-2 h-2 rounded-full bg-danger mr-2" />
                <Text className="text-sm font-body text-gray-700">{pii.label}</Text>
              </View>
            ))}
        </Card>
      )}
    </View>
  );
}
