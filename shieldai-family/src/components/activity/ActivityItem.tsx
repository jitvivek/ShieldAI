import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Badge from '@/components/common/Badge';
import AppIcon from './AppIcon';
import VerdictIndicator from './VerdictIndicator';
import LanguageTag from './LanguageTag';
import { formatRelativeTime } from '@/utils/formatters';

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

interface ActivityItemProps {
  activity: Activity;
  onPress?: () => void;
}

export default function ActivityItem({ activity, onPress }: ActivityItemProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(parent)/activity/${activity.id}`);
    }
  };

  return (
    <Pressable onPress={handlePress} className="flex-row items-center py-3 border-b border-gray-100">
      <VerdictIndicator verdict={activity.verdict} />
      <AppIcon appName={activity.appName} size={36} />
      <View className="flex-1 ml-3">
        <Text className="text-sm font-body text-gray-900" numberOfLines={1}>
          {activity.textPreview}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-xs font-body text-gray-500">
            {activity.appName} · {formatRelativeTime(activity.createdAt)}
          </Text>
          {activity.language && <LanguageTag language={activity.language} />}
        </View>
      </View>
      <Badge
        variant={activity.verdict === 'blocked' ? 'blocked' : activity.verdict === 'flagged' ? 'warning' : 'safe'}
        label={activity.verdict}
      />
    </Pressable>
  );
}
