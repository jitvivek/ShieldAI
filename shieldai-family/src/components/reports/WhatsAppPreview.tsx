import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from '@/components/common/Card';

interface WhatsAppPreviewProps {
  report: {
    totalScans: number;
    safeCount: number;
    flaggedCount: number;
    blockedCount: number;
    safetyScore: number;
    totalMinutes: number;
  };
}

export default function WhatsAppPreview({ report }: WhatsAppPreviewProps) {
  const { t } = useTranslation();
  const safePct = report.totalScans > 0 ? Math.round((report.safeCount / report.totalScans) * 100) : 100;

  const message = `🛡️ *ShieldAI Family — Weekly Report*

📊 *Summary*
• AI interactions: ${report.totalScans}
• Safe: ${report.safeCount} (${safePct}%)
• Flagged: ${report.flaggedCount}
• Blocked: ${report.blockedCount}
• AI time: ${report.totalMinutes} min

🏆 Safety score: ${report.safetyScore}/100

📱 Open ShieldAI Family app for full details`;

  return (
    <Card className="mb-4">
      <Text className="text-base font-heading font-medium text-gray-900 mb-3">
        {t('reports.whatsappPreview')}
      </Text>
      <View className="bg-green-50 rounded-xl p-3 border border-green-200">
        <Text className="text-xs font-body text-gray-700 leading-5">{message}</Text>
      </View>
    </Card>
  );
}
