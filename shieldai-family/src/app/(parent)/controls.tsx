import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/common/Card';

interface ControlItem {
  icon: string;
  titleKey: string;
  descKey: string;
  route: string;
}

const CONTROLS: ControlItem[] = [
  { icon: 'funnel', titleKey: 'controls.contentFilter', descKey: 'controls.contentFilterDesc', route: '/(parent)/controls/content-filter' },
  { icon: 'finger-print', titleKey: 'controls.piiProtection', descKey: 'controls.piiProtectionDesc', route: '/(parent)/controls/pii-protection' },
  { icon: 'time', titleKey: 'controls.timeLimits', descKey: 'controls.timeLimitsDesc', route: '/(parent)/controls/time-limits' },
  { icon: 'apps', titleKey: 'controls.appRules', descKey: 'controls.appRulesDesc', route: '/(parent)/controls/app-rules' },
  { icon: 'people', titleKey: 'controls.ageTier', descKey: 'controls.ageTierDesc', route: '/(parent)/controls/age-tier' },
  { icon: 'ban', titleKey: 'controls.blockKeywords', descKey: 'controls.blockKeywordsDesc', route: '/(parent)/controls/block-keywords' },
];

export default function Controls() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white pt-14 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
      <Text className="text-2xl font-heading font-bold text-gray-900 mb-4">
        {t('controls.title')}
      </Text>

      {CONTROLS.map((item) => (
        <Pressable key={item.route} onPress={() => router.push(item.route as any)}>
          <Card className="mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3">
                <Ionicons name={item.icon as any} size={20} color="#0D9488" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-heading font-medium text-gray-900">
                  {t(item.titleKey)}
                </Text>
                <Text className="text-sm font-body text-gray-500">{t(item.descKey)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </View>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}
