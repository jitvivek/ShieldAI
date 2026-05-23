import { Pressable, Text, ActivityIndicator, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const base = 'py-4 px-6 rounded-xl items-center justify-center flex-row';
  const variants = {
    primary: 'bg-primary-600',
    secondary: 'bg-gray-100 border border-gray-200',
    danger: 'bg-danger',
    ghost: 'bg-transparent',
  };
  const textVariants = {
    primary: 'text-white font-bold',
    secondary: 'text-gray-900 font-medium',
    danger: 'text-white font-bold',
    ghost: 'text-primary-600 font-medium',
  };
  const disabledStyle = disabled || loading ? 'opacity-60' : '';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${disabledStyle} ${className}`}
    >
      {loading && <ActivityIndicator color={variant === 'secondary' ? '#0D9488' : '#fff'} size="small" style={{ marginRight: 8 }} />}
      <Text className={`text-base font-heading ${textVariants[variant]}`}>{title}</Text>
    </Pressable>
  );
}
