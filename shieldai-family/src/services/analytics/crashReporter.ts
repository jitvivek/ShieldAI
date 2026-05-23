import * as Sentry from '@sentry/react-native';
import { CONFIG } from '@/constants/config';

class CrashReporter {
  initialize(): void {
    Sentry.init({
      dsn: CONFIG.SENTRY_DSN,
      tracesSampleRate: 0.2,
      environment: CONFIG.NODE_ENV,
    });
  }

  captureException(error: Error, context?: Record<string, any>): void {
    if (context) {
      Sentry.setContext('extra', context);
    }
    Sentry.captureException(error);
  }

  setUser(id: string, phone?: string): void {
    Sentry.setUser({ id, phone });
  }

  clearUser(): void {
    Sentry.setUser(null);
  }
}

export const crashReporter = new CrashReporter();
