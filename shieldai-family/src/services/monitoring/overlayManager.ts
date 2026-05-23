import { NativeModules, Platform } from 'react-native';

interface OverlayOptions {
  type: 'warning' | 'blocked' | 'info';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class OverlayManager {
  private get module() {
    return NativeModules.ShieldModule;
  }

  async show(options: OverlayOptions): Promise<void> {
    if (Platform.OS !== 'android' || !this.module?.showOverlay) return;
    this.module.showOverlay(options);
  }

  showPiiWarning(piiType: string): void {
    this.show({
      type: 'warning',
      title: 'Personal data detected',
      message: `ShieldAI detected a ${piiType}. This has been blocked for safety.`,
      severity: 'critical',
    });
  }

  showContentBlocked(category: string): void {
    this.show({
      type: 'blocked',
      title: 'Content blocked',
      message: `ShieldAI blocked this ${category} content to keep you safe.`,
      severity: 'high',
    });
  }

  showTimeLimitReached(): void {
    this.show({
      type: 'blocked',
      title: 'Time limit reached',
      message: 'Your daily AI time limit has been reached. Try again tomorrow.',
      severity: 'medium',
    });
  }

  showBlocked(appName: string): void {
    this.show({
      type: 'blocked',
      title: `${appName} is blocked`,
      message: 'This AI app has been blocked by your parent.',
      severity: 'high',
    });
  }

  async dismiss(): Promise<void> {
    if (Platform.OS !== 'android' || !this.module?.dismissOverlay) return;
    this.module.dismissOverlay();
  }
}

export const overlayManager = new OverlayManager();
