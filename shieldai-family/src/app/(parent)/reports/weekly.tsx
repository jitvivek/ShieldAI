import { ScrollView, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useReports } from '@/hooks/useReports';
import CategoryBreakdown from '@/components/reports/CategoryBreakdown';
import SafetyTrend from '@/components/reports/SafetyTrend';
import TopConcerns from '@/components/reports/TopConcerns';
import WhatsAppPreview from '@/components/reports/WhatsAppPreview';

export default function WeeklyReport() {
  const { t } = useTranslation();
  const { latestReport } = useReports();

  return (
    <ScrollView className="flex-1 bg-white pt-14 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
      <Text className="text-2xl font-heading font-bold text-gray-900 mb-6">
        {t('reports.weeklyTitle')}
      </Text>

      {latestReport && (
        <>
          <View className="bg-surface-light rounded-xl p-4 mb-4">
            <View className="flex-row justify-between">
              <View>
                <Text className="text-sm font-body text-gray-500">{t('reports.totalScans')}</Text>
                <Text className="text-2xl font-mono font-bold text-gray-900">{latestReport.totalScans}</Text>
              </View>
              <View>
                <Text className="text-sm font-body text-gray-500">{t('reports.safetyScore')}</Text>
                <Text className="text-2xl font-mono font-bold text-safe">{latestReport.safetyScore}/100</Text>
              </View>
            </View>
          </View>

          <CategoryBreakdown data={latestReport.topCategories} />
          <SafetyTrend />
          <TopConcerns flaggedCount={latestReport.flaggedCount} blockedCount={latestReport.blockedCount} />
          <WhatsAppPreview report={latestReport} />
        </>
      )}
    </ScrollView>
  );
}
