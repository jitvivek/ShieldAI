export const CONFIG = {
  SHIELDAI_API_URL: process.env.EXPO_PUBLIC_SHIELDAI_API_URL ?? 'https://api.shieldai.dev',
  SHIELDAI_API_KEY: process.env.EXPO_PUBLIC_SHIELDAI_API_KEY ?? '',
  BACKEND_API_URL: process.env.EXPO_PUBLIC_BACKEND_API_URL ?? 'https://family-api.shieldai.dev',
  BACKEND_WS_URL: process.env.EXPO_PUBLIC_BACKEND_WS_URL ?? 'wss://family-api.shieldai.dev/ws',
  RAZORPAY_KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ?? '',
  POSTHOG_API_KEY: process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '',
  POSTHOG_HOST: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  APP_VERSION: '1.0.0',
  MIN_ANDROID_API: 26,
  MIN_IOS_VERSION: '15.0',
};
