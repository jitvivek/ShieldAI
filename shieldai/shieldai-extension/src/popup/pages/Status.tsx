import { useEffect, useState } from 'react';
import { ShieldBadge } from '../components/ShieldBadge';
import { StatRow } from '../components/StatRow';
import type { DailyStats } from '../../shared/types';

export default function Status() {
  const [stats, setStats] = useState<DailyStats>({
    date: '',
    scansToday: 0,
    blocked: 0,
    piiCaught: 0,
    languagesDetected: [],
  });
  const [currentSite, setCurrentSite] = useState<string>('');

  useEffect(() => {
    chrome.storage.local.get(['dailyStats'], (result) => {
      if (result.dailyStats) setStats(result.dailyStats);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        try {
          const url = new URL(tabs[0].url);
          setCurrentSite(url.hostname);
        } catch { /* ignore */ }
      }
    });
  }, []);

  const getStatus = () => {
    if (stats.blocked > 0) return 'blocked';
    if (stats.scansToday > 0) return 'safe';
    return 'safe';
  };

  const statusText = () => {
    if (stats.blocked > 0) return `${stats.blocked} blocks today`;
    return 'Protected';
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-center mb-4">
        <ShieldBadge status={getStatus()} />
        <p className="text-sm font-medium mt-2 text-gray-700">{statusText()}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatRow icon="🔍" label="Scans today" value={stats.scansToday} />
        <StatRow icon="🚫" label="Blocked" value={stats.blocked} />
        <StatRow icon="🔒" label="PII caught" value={stats.piiCaught} />
        <StatRow icon="🌐" label="Languages" value={stats.languagesDetected.length} />
      </div>

      {currentSite && (
        <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-xs text-gray-600">{currentSite} — monitoring</span>
        </div>
      )}
    </div>
  );
}
