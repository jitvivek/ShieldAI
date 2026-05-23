export interface AIApp {
  name: string;
  packageName: string;
  icon: any;
  inputViewId?: string;
  inputClassName: string;
  responseViewId?: string | null;
  urlPatterns?: string[];
  color: string;
}

export const AI_APPS: AIApp[] = [
  {
    name: 'ChatGPT',
    packageName: 'com.openai.chatgpt',
    icon: require('@/assets/icons/chatgpt.png'),
    inputViewId: 'com.openai.chatgpt:id/composer_edit_text',
    inputClassName: 'android.widget.EditText',
    responseViewId: 'com.openai.chatgpt:id/message_text',
    color: '#10A37F',
  },
  {
    name: 'Gemini',
    packageName: 'com.google.android.apps.bard',
    icon: require('@/assets/icons/gemini.png'),
    inputViewId: 'com.google.android.apps.bard:id/input_field',
    inputClassName: 'android.widget.EditText',
    responseViewId: null,
    color: '#4285F4',
  },
  {
    name: 'Copilot',
    packageName: 'com.microsoft.copilot',
    icon: require('@/assets/icons/copilot.png'),
    inputViewId: 'com.microsoft.copilot:id/input_box',
    inputClassName: 'android.widget.EditText',
    color: '#7F7FD5',
  },
  {
    name: 'Perplexity',
    packageName: 'ai.perplexity.app.android',
    icon: require('@/assets/icons/perplexity.png'),
    inputClassName: 'android.widget.EditText',
    color: '#20808D',
  },
  {
    name: 'Bing AI',
    packageName: 'com.microsoft.bing',
    icon: require('@/assets/icons/browser-ai.png'),
    inputClassName: 'android.widget.EditText',
    color: '#008373',
  },
  {
    name: 'Browser AI (Chrome)',
    packageName: 'com.android.chrome',
    icon: require('@/assets/icons/browser-ai.png'),
    urlPatterns: ['chat.openai.com', 'gemini.google.com', 'claude.ai', 'perplexity.ai'],
    inputClassName: 'android.widget.EditText',
    color: '#4285F4',
  },
];
