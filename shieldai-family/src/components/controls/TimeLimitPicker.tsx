import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';

interface TimeLimitPickerProps {
  value: number;
  onChange: (value: number) => void;
}

export default function TimeLimitPicker({ value, onChange }: TimeLimitPickerProps) {
  const handleChange = (val: number) => {
    const rounded = Math.round(val / 15) * 15;
    onChange(Math.max(15, rounded));
  };

  return (
    <View className="bg-surface-light rounded-xl p-4">
      <Slider
        minimumValue={15}
        maximumValue={240}
        step={15}
        value={value}
        onValueChange={handleChange}
        minimumTrackTintColor="#0D9488"
        maximumTrackTintColor="#E2E8F0"
        thumbTintColor="#0D9488"
      />
      <View className="flex-row justify-between mt-2">
        <Text className="text-xs font-body text-gray-400">15 min</Text>
        <Text className="text-xs font-body text-gray-400">4 hrs</Text>
      </View>
    </View>
  );
}
