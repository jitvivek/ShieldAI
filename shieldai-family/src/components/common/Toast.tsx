import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const COLORS = {
  success: 'bg-safe',
  error: 'bg-danger',
  info: 'bg-primary-600',
};

export default function Toast({ message, type = 'info', visible, onHide, duration = 3000 }: ToastProps) {
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 }, () => {
          runOnJS(onHide)();
        });
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={animatedStyle}
      className={`absolute top-14 left-5 right-5 ${COLORS[type]} rounded-xl py-3 px-4 z-50`}
    >
      <Text className="text-white font-body font-medium text-center">{message}</Text>
    </Animated.View>
  );
}
