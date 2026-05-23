import { View, TextInput } from 'react-native';
import { useRef, useEffect } from 'react';

interface PinInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}

export default function PinInput({ length, value, onChange, onComplete }: PinInputProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value]);

  return (
    <View className="items-center">
      <View className="flex-row justify-center mb-4">
        {Array.from({ length }).map((_, i) => (
          <View
            key={i}
            className={`w-5 h-5 rounded-full mx-3 ${
              i < value.length ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/[^0-9]/g, '').slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus
        className="opacity-0 absolute w-full h-12"
        caretHidden
      />
      <View className="w-full h-12" onTouchEnd={() => inputRef.current?.focus()} />
    </View>
  );
}
