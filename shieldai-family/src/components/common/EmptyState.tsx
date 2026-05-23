import { View, Text, Image } from 'react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  image?: any;
}

export default function EmptyState({ title, description, image }: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-16 px-8">
      {image && <Image source={image} className="w-40 h-40 mb-6" resizeMode="contain" />}
      <Text className="text-lg font-heading font-bold text-gray-900 text-center">{title}</Text>
      <Text className="text-sm font-body text-gray-500 text-center mt-2">{description}</Text>
    </View>
  );
}
