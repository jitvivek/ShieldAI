import LottieView from 'lottie-react-native';
import { View } from 'react-native';

interface ShieldAnimationProps {
  status: 'active' | 'warning' | 'blocked' | 'offline';
  size?: number;
}

const ANIMATIONS = {
  active: require('@/assets/animations/shield-active.json'),
  warning: require('@/assets/animations/shield-warning.json'),
  blocked: require('@/assets/animations/shield-blocked.json'),
  offline: require('@/assets/animations/shield-offline.json'),
};

export default function ShieldAnimation({ status, size = 200 }: ShieldAnimationProps) {
  return (
    <View style={{ width: size, height: size }}>
      <LottieView source={ANIMATIONS[status]} autoPlay loop style={{ width: size, height: size }} />
    </View>
  );
}
