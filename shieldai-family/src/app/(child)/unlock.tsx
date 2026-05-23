import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import PinInput from '@/components/auth/PinInput';
import { pinManager } from '@/services/auth/pinManager';

export default function Unlock() {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handlePinComplete = async (value: string) => {
    const valid = await pinManager.verifyPin(value);
    if (valid) {
      router.replace('/(parent)/dashboard');
    } else {
      setAttempts((prev) => prev + 1);
      setError(t('child.wrongPin'));
      if (attempts >= 4) {
        setError(t('child.tooManyAttempts'));
      }
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-2xl font-heading font-bold text-gray-900 mb-2">
        {t('child.unlockTitle')}
      </Text>
      <Text className="text-base font-body text-gray-500 mb-10">
        {t('child.unlockSubtitle')}
      </Text>

      <PinInput length={4} value="" onChange={() => {}} onComplete={handlePinComplete} />

      {error ? (
        <Text className="text-danger text-sm font-body mt-4">{error}</Text>
      ) : null}
    </View>
  );
}
