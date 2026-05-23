import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import Button from '@/components/common/Button';

export default function SetupComplete() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="flex-1 bg-white px-6 items-center justify-center">
      <LottieView
        source={require('@/assets/animations/success.json')}
        autoPlay
        loop={false}
        style={{ width: 180, height: 180 }}
      />

      <Text className="text-3xl font-heading font-bold text-gray-900 mt-6 text-center">
        {t('auth.setupCompleteTitle')}
      </Text>
      <Text className="text-base font-body text-gray-600 mt-3 text-center px-4">
        {t('auth.setupCompleteSubtitle')}
      </Text>

      <View className="w-full mt-12">
        <Button
          title={t('auth.goToDashboard')}
          onPress={() => router.replace('/(parent)/dashboard')}
        />
      </View>
    </View>
  );
}
