import { View, Text, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';

interface PiiSettings {
  aadhaar: boolean;
  pan: boolean;
  upiId: boolean;
  indianPhone: boolean;
  email: boolean;
  schoolName: boolean;
  homeAddress: boolean;
  parentName: boolean;
}

interface PiiTypeGridProps {
  settings: PiiSettings;
  onToggle: (key: keyof PiiSettings) => void;
}

const PII_TYPES: Array<{ key: keyof PiiSettings; icon: string }> = [
  { key: 'aadhaar', icon: '🆔' },
  { key: 'pan', icon: '💳' },
  { key: 'upiId', icon: '📱' },
  { key: 'indianPhone', icon: '📞' },
  { key: 'email', icon: '✉️' },
  { key: 'schoolName', icon: '🏫' },
  { key: 'homeAddress', icon: '🏠' },
  { key: 'parentName', icon: '👤' },
];

export default function PiiTypeGrid({ settings, onToggle }: PiiTypeGridProps) {
  const { t } = useTranslation();

  return (
    <View>
      {PII_TYPES.map((pii) => (
        <View key={pii.key} className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center flex-1">
            <Text className="text-lg mr-2">{pii.icon}</Text>
            <Text className="text-sm font-body text-gray-800">{t(`pii.${pii.key}`)}</Text>
          </View>
          <Switch
            value={settings[pii.key]}
            onValueChange={() => onToggle(pii.key)}
            trackColor={{ false: '#E2E8F0', true: '#0D9488' }}
            thumbColor="#fff"
          />
        </View>
      ))}
    </View>
  );
}
