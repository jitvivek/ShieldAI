import { useEffect, useState } from 'react';
import { ScanItem } from '../components/ScanItem';
import type { ScanHistoryItem } from '../../shared/types';

export default function History() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    chrome.storage.local.get(['scanHistory'], (result) => {
      if (result.scanHistory) setHistory(result.scanHistory.slice(0, 20));
    });
  }, []);

  if (history.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        No scans yet. Start chatting with AI and ShieldAI will protect you.
      </div>
    );
  }

  return (
    <div className="p-2">
      <h2 className="text-sm font-semibold text-gray-700 px-2 mb-2">Recent Scans</h2>
      <div className="space-y-1">
        {history.map((item) => (
          <ScanItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
