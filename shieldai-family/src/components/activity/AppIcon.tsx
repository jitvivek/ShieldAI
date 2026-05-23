import { View, Image } from 'react-native';

const APP_ICONS: Record<string, any> = {
  ChatGPT: require('@/assets/icons/chatgpt.png'),
  Gemini: require('@/assets/icons/gemini.png'),
  Claude: require('@/assets/icons/claude.png'),
  Copilot: require('@/assets/icons/copilot.png'),
  Perplexity: require('@/assets/icons/perplexity.png'),
};

const DEFAULT_ICON = require('@/assets/icons/browser-ai.png');

interface AppIconProps {
  appName: string;
  size?: number;
}

export default function AppIcon({ appName, size = 32 }: AppIconProps) {
  const icon = APP_ICONS[appName] ?? DEFAULT_ICON;

  return (
    <Image
      source={icon}
      style={{ width: size, height: size, borderRadius: size / 4 }}
      resizeMode="contain"
    />
  );
}
