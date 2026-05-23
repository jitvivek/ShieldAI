import { View, Text, Pressable, Modal as RNModal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View className="bg-white rounded-t-3xl px-5 pb-8 pt-4 absolute bottom-0 left-0 right-0 max-h-[80%]">
        <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />
        {title && (
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-heading font-bold text-gray-900">{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color="#64748B" />
            </Pressable>
          </View>
        )}
        {children}
      </View>
    </RNModal>
  );
}
