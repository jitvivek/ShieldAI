import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface KeywordEditorProps {
  keywords: string[];
  onRemove: (keyword: string) => void;
}

export default function KeywordEditor({ keywords, onRemove }: KeywordEditorProps) {
  return (
    <View className="flex-row flex-wrap">
      {keywords.map((kw) => (
        <View key={kw} className="flex-row items-center bg-red-50 rounded-full px-3 py-1.5 mr-2 mb-2">
          <Text className="text-sm font-body text-red-800">{kw}</Text>
          <Pressable onPress={() => onRemove(kw)} hitSlop={8} className="ml-1.5">
            <Ionicons name="close-circle" size={16} color="#EF4444" />
          </Pressable>
        </View>
      ))}
    </View>
  );
}
