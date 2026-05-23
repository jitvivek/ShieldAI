import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';
import QrDisplay from '@/components/auth/QrDisplay';
import { devicePairing } from '@/services/sync/devicePairing';

export default function PairDevice() {
  const { t } = useTranslation();
  const router = useRouter();
  const [pairingCode, setPairingCode] = useState('');
  const [paired, setPaired] = useState(false);

  useEffect(() => {
    const code = devicePairing.generatePairingCode();
    setPairingCode(code);

    const unsubscribe = devicePairing.listenForPairing(code, () => {
      setPaired(true);
    });

    return () => unsubscribe();
  }, []);

  const handleSkip = () => {
    router.push('/(auth)/enable-protection');
  };

  const handleContinue = () => {
    router.push('/(auth)/enable-protection');
  };

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Text className="text-3xl font-heading font-bold text-gray-900 mb-2">
        {t('auth.pairDeviceTitle')}
      </Text>
      <Text className="text-base font-body text-gray-600 mb-8">
        {t('auth.pairDeviceSubtitle')}
      </Text>

      <View className="items-center my-8">
        {pairingCode ? (
          <QrDisplay value={pairingCode} size={220} />
        ) : (
          <View className="w-56 h-56 bg-gray-100 rounded-2xl items-center justify-center">
            <Text className="text-gray-400 font-body">{t('common.loading')}</Text>
          </View>
        )}
      </View>

      {paired ? (
        <View className="items-center mb-8">
          <Text className="text-safe text-lg font-heading font-bold">
            {t('auth.devicePaired')}
          </Text>
        </View>
      ) : (
        <Text className="text-center text-sm font-body text-gray-500 mb-8">
          {t('auth.pairInstructions')}
        </Text>
      )}

      <Button
        title={paired ? t('common.continue') : t('common.skip')}
        onPress={paired ? handleContinue : handleSkip}
      />
    </View>
  );
}
