import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

interface PanicButtonProps {
  onPress: () => void;
}

export default function PanicButton({ onPress }: PanicButtonProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.05, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        className="w-32 h-32 rounded-full bg-danger items-center justify-center shadow-lg"
        style={{ elevation: 8 }}
      >
        <Text className="text-white text-2xl font-heading font-bold">SOS</Text>
        <Text className="text-white text-xs font-body mt-1">{t('child.panicLabel')}</Text>
      </Pressable>
    </Animated.View>
  );
}
