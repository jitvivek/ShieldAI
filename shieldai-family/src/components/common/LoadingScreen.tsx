import { View, Text, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';

export default function LoadingScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <LottieView
        source={require('@/assets/animations/scanning.json')}
        autoPlay
        loop
        style={{ width: 120, height: 120 }}
      />
      <Text className="text-base font-body text-gray-500 mt-4">Loading...</Text>
    </View>
  );
}
