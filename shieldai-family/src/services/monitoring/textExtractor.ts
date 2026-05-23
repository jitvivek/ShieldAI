import { AI_APPS } from '@/utils/aiAppRegistry';

class TextExtractor {
  getInputViewId(packageName: string): string | null {
    const app = AI_APPS.find((a) => a.packageName === packageName);
    return app?.inputViewId ?? null;
  }

  getInputClassName(packageName: string): string {
    const app = AI_APPS.find((a) => a.packageName === packageName);
    return app?.inputClassName ?? 'android.widget.EditText';
  }

  shouldMonitorUrl(packageName: string, url: string): boolean {
    const app = AI_APPS.find((a) => a.packageName === packageName);
    if (!app?.urlPatterns) return true;
    return app.urlPatterns.some((pattern) => url.includes(pattern));
  }
}

export const textExtractor = new TextExtractor();
