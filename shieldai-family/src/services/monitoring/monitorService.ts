import { Platform } from 'react-native';
import { accessibilityBridge } from './accessibilityBridge';
import { appDetector } from './appDetector';
import { textExtractor } from './textExtractor';
import { overlayManager } from './overlayManager';
import { piiScanner } from '@/services/detection/piiScanner';
import { localEngine } from '@/services/detection/localEngine';
import { scanService } from '@/services/detection/scanService';
import { scanQueue } from '@/services/detection/scanQueue';
import { usageLimiter } from '@/services/protection/usageLimiter';
import { useSettingsStore } from '@/store/settingsStore';
import { useActivityStore } from '@/store/activityStore';

class MonitorService {
  private isRunning = false;

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    if (Platform.OS === 'android') {
      await accessibilityBridge.initialize();
      accessibilityBridge.onInteraction(this.handleInteraction.bind(this));
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (Platform.OS === 'android') {
      accessibilityBridge.removeAllListeners();
    }
  }

  private async handleInteraction(event: {
    packageName: string;
    appName: string;
    text: string;
    eventType: 'input' | 'response';
    timestamp: number;
    viewId: string | null;
  }): Promise<void> {
    const settings = useSettingsStore.getState();
    const appRule = settings.appRules[event.packageName];

    if (appRule === 'allow') {
      this.logActivity(event, 'safe', null, null);
      return;
    }

    if (appRule === 'block') {
      overlayManager.showBlocked(event.appName);
      this.logActivity(event, 'blocked', 'app_blocked', null);
      return;
    }

    // Check usage limits
    const limitExceeded = usageLimiter.isLimitExceeded();
    if (limitExceeded) {
      overlayManager.showTimeLimitReached();
      this.logActivity(event, 'blocked', 'time_limit', null);
      return;
    }

    // Step 1: Immediate PII scan
    const piiResult = piiScanner.scan(event.text);
    if (piiResult.found) {
      overlayManager.showPiiWarning(piiResult.matches[0].label);
      this.logActivity(event, 'blocked', 'pii_detected', piiResult);
      return;
    }

    // Step 2: Local rule engine
    const ruleResult = localEngine.scan(event.text, settings.ageTier);
    if (ruleResult.score > 0.7) {
      overlayManager.showContentBlocked(ruleResult.category);
      this.logActivity(event, 'blocked', ruleResult.category, ruleResult);
      return;
    }

    // Step 3: API scan (background, non-blocking)
    try {
      const apiResult = await scanService.detect(event.text);
      if (apiResult.verdict === 'malicious') {
        overlayManager.showContentBlocked(apiResult.category);
        this.logActivity(event, 'blocked', apiResult.category, apiResult);
      } else if (apiResult.verdict === 'suspicious') {
        this.logActivity(event, 'flagged', apiResult.category, apiResult);
      } else {
        this.logActivity(event, 'safe', null, apiResult);
      }
    } catch {
      // Offline fallback
      if (ruleResult.score > 0.4) {
        this.logActivity(event, 'flagged', ruleResult.category, ruleResult);
      } else {
        this.logActivity(event, 'safe', null, ruleResult);
        scanQueue.enqueue(event);
      }
    }

    usageLimiter.trackUsage(event.timestamp);
  }

  private logActivity(
    event: { packageName: string; appName: string; text: string; eventType: string; timestamp: number },
    verdict: string,
    category: string | null,
    scanResult: any
  ): void {
    const preview = event.text.slice(0, 80);
    useActivityStore.getState().addActivity({
      appName: event.appName,
      appPackage: event.packageName,
      textPreview: preview,
      direction: event.eventType as 'input' | 'response',
      verdict,
      riskScore: scanResult?.score ?? 0,
      category,
      language: scanResult?.language ?? null,
      piiDetected: scanResult?.matches ?? null,
      scanSource: scanResult?.source ?? 'local',
      createdAt: new Date(event.timestamp).toISOString(),
    });
  }
}

export const monitorService = new MonitorService();
