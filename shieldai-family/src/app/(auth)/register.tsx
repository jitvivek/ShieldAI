import { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';

export default function Register() {
  const { t } = useTranslation();
  const router = useRouter();
  const { updateProfile } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() || undefined });
      router.push('/(auth)/setup-child');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-16">
      <Text className="text-3xl font-heading font-bold text-gray-900 mb-2">
        {t('auth.registerTitle')}
      </Text>
      <Text className="text-base font-body text-gray-600 mb-8">
        {t('auth.registerSubtitle')}
      </Text>

      <View className="mb-4">
        <Text className="text-sm font-body font-medium text-gray-700 mb-1">
          {t('auth.nameLabel')}
        </Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-lg font-body"
          value={name}
          onChangeText={setName}
          placeholder={t('auth.namePlaceholder')}
          autoCapitalize="words"
        />
      </View>

      <View className="mb-8">
        <Text className="text-sm font-body font-medium text-gray-700 mb-1">
          {t('auth.emailLabel')}
        </Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-lg font-body"
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text className="text-xs font-body text-gray-500 mt-1">
          {t('auth.emailOptional')}
        </Text>
      </View>

      <Button title={t('common.continue')} onPress={handleRegister} loading={loading} />
    </ScrollView>
  );
}
