import { useState } from 'react';
import { View, Text, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';
import { permissions } from '@/utils/permissions';

export default function EnableProtection() {
  const { t } = useTranslation();
  const router = useRouter();
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [overlayEnabled, setOverlayEnabled] = useState(false);

  const handleOpenAccessibility = async () => {
    if (Platform.OS === 'android') {
      await Linking.openSettings();
      const enabled = await permissions.checkAccessibilityService();
      setAccessibilityEnabled(enabled);
    }
  };

  const handleOpenOverlay = async () => {
    if (Platform.OS === 'android') {
      await permissions.requestOverlayPermission();
      const enabled = await permissions.checkOverlayPermission();
      setOverlayEnabled(enabled);
    }
  };

  const handleContinue = () => {
    router.push('/(auth)/set-pin');
  };

  const isAndroid = Platform.OS === 'android';

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Text className="text-3xl font-heading font-bold text-gray-900 mb-2">
        {t('auth.enableProtectionTitle')}
      </Text>
      <Text className="text-base font-body text-gray-600 mb-8">
        {isAndroid ? t('auth.enableProtectionAndroid') : t('auth.enableProtectionIos')}
      </Text>

      {isAndroid ? (
        <View className="space-y-4">
          <View className="bg-surface-light rounded-xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-heading font-medium text-gray-900">
                  {t('auth.accessibilityService')}
                </Text>
                <Text className="text-sm font-body text-gray-500 mt-1">
                  {t('auth.accessibilityDesc')}
                </Text>
              </View>
              <View className={`w-6 h-6 rounded-full ${accessibilityEnabled ? 'bg-safe' : 'bg-gray-300'}`} />
            </View>
            <Button
              title={accessibilityEnabled ? t('common.done') : t('auth.openSettings')}
              variant={accessibilityEnabled ? 'secondary' : 'primary'}
              onPress={handleOpenAccessibility}
              className="mt-3"
            />
          </View>

          <View className="bg-surface-light rounded-xl p-4 border border-gray-200 mt-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-heading font-medium text-gray-900">
                  {t('auth.overlayPermission')}
                </Text>
                <Text className="text-sm font-body text-gray-500 mt-1">
                  {t('auth.overlayDesc')}
                </Text>
              </View>
              <View className={`w-6 h-6 rounded-full ${overlayEnabled ? 'bg-safe' : 'bg-gray-300'}`} />
            </View>
            <Button
              title={overlayEnabled ? t('common.done') : t('auth.grantPermission')}
              variant={overlayEnabled ? 'secondary' : 'primary'}
              onPress={handleOpenOverlay}
              className="mt-3"
            />
          </View>
        </View>
      ) : (
        <View className="bg-surface-light rounded-xl p-4 border border-gray-200">
          <Text className="text-base font-heading font-medium text-gray-900">
            {t('auth.iosVpnSetup')}
          </Text>
          <Text className="text-sm font-body text-gray-500 mt-2">
            {t('auth.iosVpnDesc')}
          </Text>
        </View>
      )}

      <View className="mt-auto mb-10">
        <Button title={t('common.continue')} onPress={handleContinue} />
      </View>
    </View>
  );
}
