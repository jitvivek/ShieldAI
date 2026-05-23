import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';
import OtpInput from '@/components/auth/OtpInput';
import { useAuthStore } from '@/store/authStore';
import { firebaseAuth } from '@/services/auth/firebaseAuth';

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      setError(t('auth.invalidPhone'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      const confirmation = await firebaseAuth.sendOtp(fullPhone);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (e: any) {
      setError(e.message || t('auth.otpFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError(t('auth.invalidOtp'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await firebaseAuth.verifyOtp(confirmationResult, otp);
      setUser(user);
      if (user.isNewUser) {
        router.replace('/(auth)/register');
      } else {
        router.replace('/');
      }
    } catch (e: any) {
      setError(e.message || t('auth.verifyFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 pt-20">
        <Text className="text-3xl font-heading font-bold text-gray-900 mb-2">
          {step === 'phone' ? t('auth.loginTitle') : t('auth.verifyTitle')}
        </Text>
        <Text className="text-base font-body text-gray-600 mb-8">
          {step === 'phone' ? t('auth.loginSubtitle') : t('auth.verifySubtitle', { phone })}
        </Text>

        {step === 'phone' ? (
          <View className="mb-6">
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3">
              <Text className="text-lg font-body text-gray-600 mr-2">+91</Text>
              <View className="w-px h-6 bg-gray-300 mr-3" />
              <Text
                className="flex-1 text-lg font-body"
                // @ts-ignore - TextInput simplified for layout
              >
                {phone}
              </Text>
            </View>
          </View>
        ) : (
          <OtpInput length={6} value={otp} onChange={setOtp} />
        )}

        {error ? (
          <Text className="text-danger text-sm font-body mb-4">{error}</Text>
        ) : null}

        <Button
          title={step === 'phone' ? t('auth.sendOtp') : t('auth.verify')}
          onPress={step === 'phone' ? handleSendOtp : handleVerifyOtp}
          loading={loading}
        />

        {step === 'otp' && (
          <Button
            title={t('auth.resendOtp')}
            variant="ghost"
            onPress={handleSendOtp}
            className="mt-4"
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
