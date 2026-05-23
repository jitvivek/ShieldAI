import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import Button from '@/components/common/Button';
import BlockedExplainer from '@/components/child/BlockedExplainer';

export default function Blocked() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <LottieView
        source={require('@/assets/animations/shield-blocked.json')}
        autoPlay
        loop={false}
        style={{ width: 120, height: 120 }}
      />

      <Text className="text-2xl font-heading font-bold text-gray-900 mt-6 text-center">
        {t('child.blockedTitle')}
      </Text>

      <BlockedExplainer />

      <View className="w-full mt-8">
        <Button title={t('common.goBack')} onPress={() => router.back()} />
      </View>
    </View>
  );
}
