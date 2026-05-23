import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import { panicService } from '@/services/communication/panicService';

export default function Panic() {
  const { t } = useTranslation();

  useEffect(() => {
    panicService.triggerPanic();
  }, []);

  return (
    <View className="flex-1 bg-primary-600 items-center justify-center px-8">
      <LottieView
        source={require('@/assets/animations/panic.json')}
        autoPlay
        loop
        style={{ width: 150, height: 150 }}
      />

      <Text className="text-3xl font-heading font-bold text-white mt-8 text-center">
        {t('child.panicTitle')}
      </Text>
      <Text className="text-lg font-body text-primary-100 mt-4 text-center">
        {t('child.panicSubtitle')}
      </Text>
      <Text className="text-base font-body text-primary-200 mt-8 text-center">
        {t('child.panicReassurance')}
      </Text>
    </View>
  );
}
