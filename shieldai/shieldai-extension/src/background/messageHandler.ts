import type { ScanRequest, ScanResponse, ScanHistoryItem, DailyStats } from '../shared/types';
import { callShieldApi } from './apiClient';
import { runOfflineDetection } from './offlineEngine';
import { updateBadge, sendBlockNotification } from './notificationManager';
import { FREE_TIER_DAILY_LIMIT, SCAN_HISTORY_MAX, DEFAULT_SETTINGS } from '../shared/constants';
import { scanForPii } from '../shared/piiPatterns';

export function handleMessage(
  message: ScanRequest,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: ScanResponse) => void
): void {
  if (message.type !== 'SCAN_PROMPT') {
    // Always respond to avoid leaving the message channel hanging
    sendResponse({
      verdict: 'safe',
      riskScore: 0,
      category: 'none',
      language: 'English',
      piiDetected: [],
      details: '',
      offline: true,
    });
    return;
  }

  processMessage(message).then(sendResponse).catch(() => {
    sendResponse({
      verdict: 'safe',
      riskScore: 0,
      category: 'error',
      language: 'English',
      piiDetected: [],
      details: 'Scan failed — allowing message.',
      offline: true,
    });
  });
}

async function processMessage(message: ScanRequest): Promise<ScanResponse> {
  // Get settings
  const { settings, dailyStats } = await chrome.storage.sync.get(['settings']).then(
    async (syncResult) => {
      const localResult = await chrome.storage.local.get(['dailyStats']);
      return {
        settings: { ...DEFAULT_SETTINGS, ...syncResult.settings },
        dailyStats: localResult.dailyStats as DailyStats,
      };
    }
  );

  // Check daily limit for free tier
  const today = new Date().toISOString().split('T')[0];
  if (dailyStats?.date === today && dailyStats.scansToday >= FREE_TIER_DAILY_LIMIT && !settings.apiKey) {
    return {
      verdict: 'safe',
      riskScore: 0,
      category: 'rate_limited',
      language: 'English',
      piiDetected: [],
      details: 'Daily scan limit reached. Upgrade for unlimited scans.',
      offline: true,
    };
  }

  // Always run PII scan locally (instant, no API needed)
  const piiMatches = settings.piiProtection ? scanForPii(message.text) : [];

  let result: ScanResponse;

  // Try API first, fallback to offline
  if (settings.apiKey) {
    const apiResult = await callShieldApi(message.text, settings.apiKey, settings.apiUrl);
    if (apiResult) {
      // Merge local PII scan with API result
      result = {
        ...apiResult,
        piiDetected: [...apiResult.piiDetected, ...piiMatches],
      };
      // Upgrade verdict if PII found locally
      if (piiMatches.length > 0 && result.verdict === 'safe') {
        result.verdict = 'malicious';
        result.category = 'pii_exposure';
        result.riskScore = Math.max(result.riskScore, 0.90);
      }
    } else {
      result = runOfflineDetection(message.text, settings.hindiHinglishDetection);
    }
  } else {
    result = runOfflineDetection(message.text, settings.hindiHinglishDetection);
  }

  // Update stats and history
  await updateStatsAndHistory(result, message.site, message.text);

  // Update badge
  updateBadge(result.verdict);

  // Send notification for blocks
  if (result.verdict === 'malicious' && settings.notifications) {
    sendBlockNotification(result.category, message.site);
  }

  return result;
}

async function updateStatsAndHistory(result: ScanResponse, site: string, text: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { dailyStats, scanHistory } = await chrome.storage.local.get(['dailyStats', 'scanHistory']);

  // Update daily stats
  const stats: DailyStats = dailyStats?.date === today ? dailyStats : {
    date: today,
    scansToday: 0,
    blocked: 0,
    piiCaught: 0,
    languagesDetected: [],
  };

  stats.scansToday++;
  if (result.verdict === 'malicious') stats.blocked++;
  stats.piiCaught += result.piiDetected.length;
  if (result.language && !stats.languagesDetected.includes(result.language)) {
    stats.languagesDetected.push(result.language);
  }

  // Add to history
  const history: ScanHistoryItem[] = scanHistory || [];
  const item: ScanHistoryItem = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    site,
    verdict: result.verdict,
    riskScore: result.riskScore,
    category: result.category,
    language: result.language,
    textPreview: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
    piiDetected: result.piiDetected,
    offline: result.offline,
  };
  history.unshift(item);

  // Trim history to max
  const trimmedHistory = history.slice(0, SCAN_HISTORY_MAX);

  await chrome.storage.local.set({ dailyStats: stats, scanHistory: trimmedHistory });
}
