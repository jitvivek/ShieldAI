import { AI_APPS } from '@/utils/aiAppRegistry';

class AppDetector {
  getAppByPackage(packageName: string) {
    return AI_APPS.find((app) => app.packageName === packageName) ?? null;
  }

  isAIApp(packageName: string): boolean {
    return AI_APPS.some((app) => app.packageName === packageName);
  }

  getAppName(packageName: string): string {
    const app = this.getAppByPackage(packageName);
    return app?.name ?? 'Unknown AI App';
  }
}

export const appDetector = new AppDetector();
