import { View } from 'react-native';

interface VerdictIndicatorProps {
  verdict: string;
}

export default function VerdictIndicator({ verdict }: VerdictIndicatorProps) {
  const color =
    verdict === 'safe' ? 'bg-safe' : verdict === 'flagged' ? 'bg-warning' : 'bg-danger';

  return <View className={`w-3 h-3 rounded-full ${color} mr-2`} />;
}
