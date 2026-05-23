import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import { useShieldStatus } from '@/hooks/useShieldStatus';
import PanicButton from '@/components/child/PanicButton';

export default function ChildStatus() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status } = useShieldStatus();

  const animationSource =
    status === 'active'
      ? require('@/assets/animations/shield-active.json')
      : status === 'warning'
      ? require('@/assets/animations/shield-warning.json')
      : require('@/assets/animations/shield-offline.json');

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <LottieView
        source={animationSource}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />

      <Text className="text-2xl font-heading font-bold text-gray-900 mt-6">
        {status === 'active' ? t('child.protected') : t('child.checkStatus')}
      </Text>
      <Text className="text-base font-body text-gray-500 mt-2 text-center">
        {status === 'active' ? t('child.protectedDesc') : t('child.checkStatusDesc')}
      </Text>

      <View className="mt-12">
        <PanicButton onPress={() => router.push('/(child)/panic')} />
      </View>

      <Pressable
        onPress={() => router.push('/(child)/history')}
        className="mt-8 py-3 px-6"
      >
        <Text className="text-primary-600 font-body font-medium">
          {t('child.viewHistory')}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/(child)/unlock')}
        className="absolute top-14 right-5 py-2 px-4"
      >
        <Text className="text-gray-400 text-xs font-body">
          {t('child.parentAccess')}
        </Text>
      </Pressable>
    </View>
  );
}
