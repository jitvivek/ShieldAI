import { View, Text } from 'react-native';

interface LanguageTagProps {
  language: string;
}

export default function LanguageTag({ language }: LanguageTagProps) {
  return (
    <View className="bg-primary-50 rounded-full px-2 py-0.5 ml-2">
      <Text className="text-[10px] font-body text-primary-700">{language}</Text>
    </View>
  );
}
