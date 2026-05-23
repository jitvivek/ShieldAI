import { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/store/settingsStore';
import KeywordEditor from '@/components/controls/KeywordEditor';
import Button from '@/components/common/Button';

export default function BlockKeywords() {
  const { t } = useTranslation();
  const { customKeywords, addKeyword, removeKeyword } = useSettingsStore();
  const [newKeyword, setNewKeyword] = useState('');

  const handleAdd = () => {
    const trimmed = newKeyword.trim();
    if (trimmed && !customKeywords.includes(trimmed)) {
      addKeyword(trimmed);
      setNewKeyword('');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white pt-14 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
      <Text className="text-2xl font-heading font-bold text-gray-900 mb-2">
        {t('controls.blockKeywords')}
      </Text>
      <Text className="text-sm font-body text-gray-500 mb-6">
        {t('controls.blockKeywordsLong')}
      </Text>

      <View className="flex-row mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 font-body mr-2"
          value={newKeyword}
          onChangeText={setNewKeyword}
          placeholder={t('controls.addKeywordPlaceholder')}
          onSubmitEditing={handleAdd}
        />
        <Button title={t('common.add')} onPress={handleAdd} className="px-4" />
      </View>

      <KeywordEditor keywords={customKeywords} onRemove={removeKeyword} />
    </ScrollView>
  );
}
