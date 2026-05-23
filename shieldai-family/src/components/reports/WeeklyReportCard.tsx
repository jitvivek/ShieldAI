import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from '@/components/common/Card';

interface WeeklyReportCardProps {
  report: {
    id: string;
    weekStartDate: string;
    totalScans: number;
    safetyScore: number;
    flaggedCount: number;
    blockedCount: number;
  };
  onPress: () => void;
}

export default function WeeklyReportCard({ report, onPress }: WeeklyReportCardProps) {
  const { t } = useTranslation();
  const scoreColor = report.safetyScore >= 80 ? 'text-safe' : report.safetyScore >= 50 ? 'text-warning' : 'text-danger';

  return (
    <Pressable onPress={onPress}>
      <Card className="mb-3">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-sm font-body text-gray-500">{report.weekStartDate}</Text>
            <Text className="text-base font-heading font-medium text-gray-900 mt-1">
              {report.totalScans} {t('reports.scans')}
            </Text>
          </View>
          <View className="items-end">
            <Text className={`text-2xl font-mono font-bold ${scoreColor}`}>
              {report.safetyScore}
            </Text>
            <Text className="text-xs text-gray-500 font-body">/100</Text>
          </View>
        </View>
        {(report.flaggedCount > 0 || report.blockedCount > 0) && (
          <View className="flex-row mt-2 pt-2 border-t border-gray-100">
            {report.flaggedCount > 0 && (
              <Text className="text-xs font-body text-warning mr-4">⚠ {report.flaggedCount} flagged</Text>
            )}
            {report.blockedCount > 0 && (
              <Text className="text-xs font-body text-danger">🚫 {report.blockedCount} blocked</Text>
            )}
          </View>
        )}
      </Card>
    </Pressable>
  );
}
