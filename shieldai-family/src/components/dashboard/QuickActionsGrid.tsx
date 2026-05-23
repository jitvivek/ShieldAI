import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

export default function QuickActionsGrid() {
  const { t } = useTranslation();
  const router = useRouter();

  const actions = [
    { icon: 'list', label: t('dashboard.quickActivity'), route: '/(parent)/activity', color: '#0D9488' },
    { icon: 'settings', label: t('dashboard.quickControls'), route: '/(parent)/controls', color: '#6366F1' },
    { icon: 'bar-chart', label: t('dashboard.quickReports'), route: '/(parent)/reports', color: '#F59E0B' },
    { icon: 'people', label: t('dashboard.quickChildren'), route: '/(parent)/children', color: '#EC4899' },
  ];

  return (
    <View className="flex-row flex-wrap -m-1.5">
      {actions.map((action) => (
        <Pressable
          key={action.route}
          onPress={() => router.push(action.route as any)}
          className="w-1/2 p-1.5"
        >
          <View className="bg-surface-light rounded-xl p-4 items-center">
            <View className="w-10 h-10 rounded-full items-center justify-center mb-2" style={{ backgroundColor: action.color + '15' }}>
              <Ionicons name={action.icon as any} size={20} color={action.color} />
            </View>
            <Text className="text-xs font-body font-medium text-gray-700">{action.label}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
