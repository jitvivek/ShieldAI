import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

interface AIInteractionEvent {
  packageName: string;
  appName: string;
  text: string;
  eventType: 'input' | 'response';
  timestamp: number;
  viewId: string | null;
}

type InteractionCallback = (event: AIInteractionEvent) => void;

class AccessibilityBridge {
  private emitter: NativeEventEmitter | null = null;
  private listeners: InteractionCallback[] = [];
  private subscription: any = null;

  async initialize(): Promise<void> {
    if (Platform.OS !== 'android') return;

    const { ShieldModule } = NativeModules;
    if (!ShieldModule) {
      console.warn('ShieldModule not available');
      return;
    }

    this.emitter = new NativeEventEmitter(ShieldModule);
    this.subscription = this.emitter.addListener('onAIInteraction', (event: AIInteractionEvent) => {
      this.listeners.forEach((cb) => cb(event));
    });
  }

  onInteraction(callback: InteractionCallback): void {
    this.listeners.push(callback);
  }

  removeAllListeners(): void {
    this.listeners = [];
    this.subscription?.remove();
    this.subscription = null;
  }

  async isServiceEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    const { ShieldModule } = NativeModules;
    if (!ShieldModule?.isAccessibilityEnabled) return false;
    return ShieldModule.isAccessibilityEnabled();
  }

  async getMonitoredApps(): Promise<string[]> {
    if (Platform.OS !== 'android') return [];
    const { ShieldModule } = NativeModules;
    if (!ShieldModule?.getMonitoredApps) return [];
    return ShieldModule.getMonitoredApps();
  }
}

export const accessibilityBridge = new AccessibilityBridge();
