import { View, Text } from 'react-native';

interface BadgeProps {
  variant: 'safe' | 'warning' | 'blocked';
  label: string;
}

const BADGE_STYLES = {
  safe: { bg: 'bg-green-100', text: 'text-green-800' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-800' },
  blocked: { bg: 'bg-red-100', text: 'text-red-800' },
};

export default function Badge({ variant, label }: BadgeProps) {
  const styles = BADGE_STYLES[variant];
  return (
    <View className={`px-2.5 py-1 rounded-full ${styles.bg}`}>
      <Text className={`text-xs font-body font-medium ${styles.text}`}>{label}</Text>
    </View>
  );
}
