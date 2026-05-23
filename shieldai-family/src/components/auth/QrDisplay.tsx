import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QrDisplayProps {
  value: string;
  size?: number;
}

export default function QrDisplay({ value, size = 200 }: QrDisplayProps) {
  return (
    <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <QRCode value={value} size={size} backgroundColor="#fff" color="#0F172A" />
    </View>
  );
}
