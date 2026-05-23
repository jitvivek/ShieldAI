import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

interface SensitivitySliderProps {
  value: 'permissive' | 'balanced' | 'strict';
  onChange: (value: 'permissive' | 'balanced' | 'strict') => void;
}

const OPTIONS: Array<{ key: 'permissive' | 'balanced' | 'strict'; color: string }> = [
  { key: 'permissive', color: 'bg-safe' },
  { key: 'balanced', color: 'bg-warning' },
  { key: 'strict', color: 'bg-danger' },
];

export default function SensitivitySlider({ value, onChange }: SensitivitySliderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row bg-gray-100 rounded-xl p-1">
      {OPTIONS.map((opt) => (
        <Pressable
          key={opt.key}
          onPress={() => onChange(opt.key)}
          className={`flex-1 py-3 rounded-lg items-center ${
            value === opt.key ? 'bg-white shadow-sm' : ''
          }`}
        >
          <View className={`w-3 h-3 rounded-full ${opt.color} mb-1`} />
          <Text
            className={`text-xs font-body ${
              value === opt.key ? 'text-gray-900 font-medium' : 'text-gray-500'
            }`}
          >
            {t(`controls.${opt.key}`)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
