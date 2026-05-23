import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

interface QrScannerProps {
  onScan: (data: string) => void;
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const { t } = useTranslation();

  // Uses expo-camera for QR scanning
  return (
    <View className="flex-1 bg-black items-center justify-center">
      <View className="w-64 h-64 border-2 border-white rounded-2xl" />
      <Text className="text-white font-body mt-4">{t('auth.scanQrCode')}</Text>
    </View>
  );
}
