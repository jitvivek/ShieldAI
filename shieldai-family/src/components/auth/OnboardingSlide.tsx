import { View, Text, Image, Dimensions } from 'react-native';

interface OnboardingSlideProps {
  title: string;
  description: string;
  image: any;
  width: number;
}

export default function OnboardingSlide({ title, description, image, width }: OnboardingSlideProps) {
  return (
    <View style={{ width }} className="items-center justify-center px-8 pt-20">
      <Image source={image} className="w-64 h-64 mb-8" resizeMode="contain" />
      <Text className="text-2xl font-heading font-bold text-gray-900 text-center mb-3">{title}</Text>
      <Text className="text-base font-body text-gray-600 text-center leading-6">{description}</Text>
    </View>
  );
}
