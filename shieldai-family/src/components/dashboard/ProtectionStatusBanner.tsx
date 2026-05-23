import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface ProtectionStatusBannerProps {
  status: 'active' | 'warning' | 'offline';
}

export default function ProtectionStatusBanner({ status }: ProtectionStatusBannerProps) {
  const { t } = useTranslation();

  const config = {
    active: { bg: 'bg-green-50', icon: 'shield-checkmark', color: '#10B981', text: t('dashboard.protectionActive') },
    warning: { bg: 'bg-amber-50', icon: 'warning', color: '#F59E0B', text: t('dashboard.protectionWarning') },
    offline: { bg: 'bg-gray-50', icon: 'cloud-offline', color: '#64748B', text: t('dashboard.protectionOffline') },
  };

  const { bg, icon, color, text } = config[status];

  return (
    <View className={`mx-5 ${bg} rounded-xl px-4 py-3 flex-row items-center`}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text className="ml-2 text-sm font-body font-medium" style={{ color }}>
        {text}
      </Text>
    </View>
  );
}
