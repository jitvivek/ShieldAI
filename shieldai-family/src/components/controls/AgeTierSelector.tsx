import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AGE_TIERS } from '@/utils/ageFilters';
import Card from '@/components/common/Card';

interface AgeTierSelectorProps {
  selected: string;
  onSelect: (tier: string) => void;
}

export default function AgeTierSelector({ selected, onSelect }: AgeTierSelectorProps) {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <View>
      {AGE_TIERS.map((tier) => (
        <Pressable key={tier.id} onPress={() => onSelect(tier.id)}>
          <Card
            className={`mb-3 ${selected === tier.id ? 'border-primary-600 border-2' : ''}`}
          >
            <View className="flex-row items-center">
              <View
                className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                  selected === tier.id ? 'border-primary-600' : 'border-gray-300'
                }`}
              >
                {selected === tier.id && <View className="w-3 h-3 rounded-full bg-primary-600" />}
              </View>
              <View className="flex-1">
                <Text className="text-base font-heading font-medium text-gray-900">
                  {isHindi ? tier.nameHi : tier.name}
                </Text>
                <Text className="text-xs font-body text-gray-500 mt-0.5">
                  {tier.ageRange[0]}–{tier.ageRange[1]} {t('controls.years')}
                </Text>
                <Text className="text-sm font-body text-gray-600 mt-1">
                  {isHindi ? tier.descriptionHi : tier.description}
                </Text>
              </View>
            </View>
          </Card>
        </Pressable>
      ))}
    </View>
  );
}
