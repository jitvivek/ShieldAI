import type { Verdict } from '../shared/types';

let blockedToday = 0;

export function updateBadge(verdict: Verdict): void {
  if (verdict === 'malicious') {
    blockedToday++;
    chrome.action.setBadgeText({ text: String(blockedToday) });
    chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
  } else if (verdict === 'suspicious') {
    chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' });
  } else {
    // Only reset color if no blocks today
    if (blockedToday === 0) {
      chrome.action.setBadgeBackgroundColor({ color: '#0D9488' });
    }
  }
}

export function sendBlockNotification(category: string, site: string): void {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('src/assets/icon-128.png'),
    title: '🛡️ ShieldAI — Message Blocked',
    message: `Blocked ${category.replace(/_/g, ' ')} on ${site}. Your data is protected.`,
    priority: 2,
  });
}

// Reset on new day
chrome.storage.local.get(['dailyStats'], (result) => {
  const today = new Date().toISOString().split('T')[0];
  if (result.dailyStats?.date === today) {
    blockedToday = result.dailyStats.blocked || 0;
    if (blockedToday > 0) {
      chrome.action.setBadgeText({ text: String(blockedToday) });
      chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
    }
  }
});
