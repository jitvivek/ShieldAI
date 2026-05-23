import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from '@/components/common/Card';
import AppIcon from '@/components/activity/AppIcon';

type AppRule = 'monitor' | 'block' | 'allow';

interface AppRuleCardProps {
  app: { name: string; packageName: string; color: string };
  rule: AppRule;
  onRuleChange: (rule: AppRule) => void;
}

const RULES: AppRule[] = ['monitor', 'block', 'allow'];

export default function AppRuleCard({ app, rule, onRuleChange }: AppRuleCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="mb-3">
      <View className="flex-row items-center mb-3">
        <AppIcon appName={app.name} size={32} />
        <Text className="text-base font-heading font-medium text-gray-900 ml-3">{app.name}</Text>
      </View>
      <View className="flex-row bg-gray-100 rounded-lg p-1">
        {RULES.map((r) => (
          <Pressable
            key={r}
            onPress={() => onRuleChange(r)}
            className={`flex-1 py-2 rounded-md items-center ${rule === r ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-body ${rule === r ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {t(`controls.rule_${r}`)}
            </Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}
