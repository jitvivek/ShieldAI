import { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';
import AgeTierSelector from '@/components/controls/AgeTierSelector';
import { useChildStore } from '@/store/childStore';
import { AGE_TIERS } from '@/utils/ageFilters';

export default function SetupChild() {
  const { t } = useTranslation();
  const router = useRouter();
  const { addChild } = useChildStore();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAgeChange = (value: string) => {
    setAge(value);
    const ageNum = parseInt(value, 10);
    if (!isNaN(ageNum)) {
      const tier = AGE_TIERS.find((t) => ageNum >= t.ageRange[0] && ageNum <= t.ageRange[1]);
      if (tier) setSelectedTier(tier.id);
    }
  };

  const handleContinue = async () => {
    if (!name.trim() || !age) return;
    setLoading(true);
    try {
      await addChild({
        name: name.trim(),
        age: parseInt(age, 10),
        ageTier: selectedTier || 'teen',
      });
      router.push('/(auth)/pair-device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-16">
      <Text className="text-3xl font-heading font-bold text-gray-900 mb-2">
        {t('auth.setupChildTitle')}
      </Text>
      <Text className="text-base font-body text-gray-600 mb-8">
        {t('auth.setupChildSubtitle')}
      </Text>

      <View className="mb-4">
        <Text className="text-sm font-body font-medium text-gray-700 mb-1">
          {t('auth.childNameLabel')}
        </Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-lg font-body"
          value={name}
          onChangeText={setName}
          placeholder={t('auth.childNamePlaceholder')}
          autoCapitalize="words"
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm font-body font-medium text-gray-700 mb-1">
          {t('auth.childAgeLabel')}
        </Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-lg font-body"
          value={age}
          onChangeText={handleAgeChange}
          placeholder="12"
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>

      <AgeTierSelector selected={selectedTier} onSelect={setSelectedTier} />

      <View className="mt-8 mb-10">
        <Button title={t('common.continue')} onPress={handleContinue} loading={loading} />
      </View>
    </ScrollView>
  );
}
