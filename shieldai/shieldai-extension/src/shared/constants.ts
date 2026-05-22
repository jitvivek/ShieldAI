export const API_URL = 'https://api.shieldai.dev';
export const API_DETECT_ENDPOINT = '/v1/detect';
export const EXTENSION_VERSION = '1.0.0';

export const FREE_TIER_DAILY_LIMIT = 50;

export const SUPPORTED_SITES = [
  { name: 'ChatGPT', patterns: ['chat.openai.com', 'chatgpt.com'] },
  { name: 'Gemini', patterns: ['gemini.google.com'] },
  { name: 'Claude', patterns: ['claude.ai'] },
  { name: 'Copilot', patterns: ['copilot.microsoft.com'] },
  { name: 'Perplexity', patterns: ['perplexity.ai'] },
  { name: 'HuggingFace', patterns: ['huggingface.co/chat'] },
] as const;

export const DEFAULT_SETTINGS = {
  apiKey: '',
  apiUrl: API_URL,
  piiProtection: true,
  harmfulContentFilter: true,
  injectionDetection: true,
  hindiHinglishDetection: true,
  notifications: true,
  badgeCounter: true,
  parentalControls: {
    enabled: false,
    pin: '',
    ageTier: 'adult' as const,
    activityLogging: false,
    parentEmail: '',
  },
  language: 'en' as const,
};

export const SCAN_HISTORY_MAX = 100;
export const PII_SCAN_DEBOUNCE_MS = 500;
export const OVERLAY_AUTO_DISMISS_MS = 10000;
