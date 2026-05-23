import { View, Text, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';

interface CategoryToggleProps {
  category: string;
  enabled: boolean;
  onToggle: () => void;
}

export default function CategoryToggle({ category, enabled, onToggle }: CategoryToggleProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
      <Text className="text-sm font-body text-gray-800 flex-1">
        {t(`categories.${category}`)}
      </Text>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: '#E2E8F0', true: '#0D9488' }}
        thumbColor="#fff"
      />
    </View>
  );
}
