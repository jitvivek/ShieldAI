import { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, ViewToken } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Button from '@/components/common/Button';
import OnboardingSlide from '@/components/auth/OnboardingSlide';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    titleKey: 'onboarding.slide1.title',
    descKey: 'onboarding.slide1.description',
    image: require('@/assets/onboarding/slide1.png'),
  },
  {
    id: '2',
    titleKey: 'onboarding.slide2.title',
    descKey: 'onboarding.slide2.description',
    image: require('@/assets/onboarding/slide2.png'),
  },
  {
    id: '3',
    titleKey: 'onboarding.slide3.title',
    descKey: 'onboarding.slide3.description',
    image: require('@/assets/onboarding/slide3.png'),
  },
];

export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      router.push('/(auth)/login');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OnboardingSlide
            title={t(item.titleKey)}
            description={t(item.descKey)}
            image={item.image}
            width={width}
          />
        )}
      />

      <View className="px-6 pb-10">
        <View className="flex-row justify-center mb-6">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`w-2.5 h-2.5 rounded-full mx-1 ${
                index === activeIndex ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </View>

        <Button
          title={activeIndex === slides.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
          onPress={handleNext}
        />

        {activeIndex < slides.length - 1 && (
          <Button
            title={t('onboarding.skip')}
            variant="ghost"
            onPress={() => router.push('/(auth)/login')}
            className="mt-3"
          />
        )}
      </View>
    </View>
  );
}
