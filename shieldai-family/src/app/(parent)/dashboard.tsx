import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import SafetyScoreGauge from '@/components/dashboard/SafetyScoreGauge';
import TodayStatsRow from '@/components/dashboard/TodayStatsRow';
import ProtectionStatusBanner from '@/components/dashboard/ProtectionStatusBanner';
import RecentAlertsList from '@/components/dashboard/RecentAlertsList';
import WeeklyChart from '@/components/dashboard/WeeklyChart';
import QuickActionsGrid from '@/components/dashboard/QuickActionsGrid';
import { useScanStats } from '@/hooks/useScanStats';
import { useShieldStatus } from '@/hooks/useShieldStatus';
import { useAlerts } from '@/hooks/useAlerts';

export default function Dashboard() {
  const { t } = useTranslation();
  const { stats, refetch: refetchStats, isLoading } = useScanStats();
  const { status } = useShieldStatus();
  const { alerts } = useAlerts({ limit: 5 });

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetchStats} />}
    >
      <View className="px-5 pt-14 pb-4">
        <Text className="text-2xl font-heading font-bold text-gray-900">
          {t('dashboard.title')}
        </Text>
        <Text className="text-sm font-body text-gray-500 mt-1">
          {t('dashboard.subtitle')}
        </Text>
      </View>

      <ProtectionStatusBanner status={status} />

      <View className="items-center py-6">
        <SafetyScoreGauge score={stats?.safetyScore ?? 100} />
      </View>

      <TodayStatsRow stats={stats} />

      <View className="px-5 mt-6">
        <Text className="text-lg font-heading font-bold text-gray-900 mb-3">
          {t('dashboard.weeklyUsage')}
        </Text>
        <WeeklyChart data={stats?.weeklyData ?? []} />
      </View>

      <View className="px-5 mt-6">
        <QuickActionsGrid />
      </View>

      <View className="px-5 mt-6">
        <Text className="text-lg font-heading font-bold text-gray-900 mb-3">
          {t('dashboard.recentAlerts')}
        </Text>
        <RecentAlertsList alerts={alerts} />
      </View>
    </ScrollView>
  );
}
