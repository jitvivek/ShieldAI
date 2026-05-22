import { handleMessage } from './messageHandler';

// Service worker entry point
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async response
});

// Set initial badge
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: '#0D9488' });
  chrome.action.setBadgeText({ text: '' });

  // Initialize storage with defaults
  chrome.storage.local.get(['dailyStats', 'scanHistory'], (result) => {
    if (!result.dailyStats) {
      chrome.storage.local.set({
        dailyStats: {
          date: new Date().toISOString().split('T')[0],
          scansToday: 0,
          blocked: 0,
          piiCaught: 0,
          languagesDetected: [],
        },
      });
    }
    if (!result.scanHistory) {
      chrome.storage.local.set({ scanHistory: [] });
    }
  });

  // Create alarm for daily stats reset (must be inside onInstalled)
  chrome.alarms.create('resetDailyStats', { periodInMinutes: 60 });
});

// Reset daily stats at midnight
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'resetDailyStats') {
    const today = new Date().toISOString().split('T')[0];
    chrome.storage.local.get(['dailyStats'], (result) => {
      if (result.dailyStats?.date !== today) {
        chrome.storage.local.set({
          dailyStats: {
            date: today,
            scansToday: 0,
            blocked: 0,
            piiCaught: 0,
            languagesDetected: [],
          },
        });
        chrome.action.setBadgeText({ text: '' });
      }
    });
  }
});
