import { View, TextInput } from 'react-native';
import { useRef } from 'react';

interface OtpInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
}

export default function OtpInput({ length, value, onChange }: OtpInputProps) {
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newValue = value.split('');
    newValue[index] = text;
    const joined = newValue.join('').slice(0, length);
    onChange(joined);

    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-center">
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => { inputs.current[i] = ref; }}
          className="w-12 h-14 mx-1.5 border-2 border-gray-300 rounded-xl text-center text-xl font-mono font-bold text-gray-900"
          maxLength={1}
          keyboardType="number-pad"
          value={value[i] || ''}
          onChangeText={(text) => handleChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          style={value[i] ? { borderColor: '#0D9488' } : undefined}
        />
      ))}
    </View>
  );
}
