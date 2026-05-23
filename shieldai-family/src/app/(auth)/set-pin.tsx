import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';
import PinInput from '@/components/auth/PinInput';
import { pinManager } from '@/services/auth/pinManager';

export default function SetPin() {
  const { t } = useTranslation();
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState('');

  const handlePinComplete = (value: string) => {
    if (step === 'create') {
      setPin(value);
      setStep('confirm');
      setError('');
    } else {
      if (value === pin) {
        pinManager.savePin(value);
        router.push('/(auth)/setup-complete');
      } else {
        setError(t('auth.pinMismatch'));
        setConfirmPin('');
      }
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Text className="text-3xl font-heading font-bold text-gray-900 mb-2">
        {step === 'create' ? t('auth.setPinTitle') : t('auth.confirmPinTitle')}
      </Text>
      <Text className="text-base font-body text-gray-600 mb-12">
        {step === 'create' ? t('auth.setPinSubtitle') : t('auth.confirmPinSubtitle')}
      </Text>

      <PinInput
        length={4}
        value={step === 'create' ? pin : confirmPin}
        onChange={step === 'create' ? setPin : setConfirmPin}
        onComplete={handlePinComplete}
      />

      {error ? (
        <Text className="text-danger text-center text-sm font-body mt-4">{error}</Text>
      ) : null}

      {step === 'confirm' && (
        <Button
          title={t('common.back')}
          variant="ghost"
          onPress={() => {
            setStep('create');
            setPin('');
            setConfirmPin('');
            setError('');
          }}
          className="mt-8"
        />
      )}
    </View>
  );
}
