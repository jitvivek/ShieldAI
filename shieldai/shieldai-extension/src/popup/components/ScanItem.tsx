import { useState } from 'react';
import type { ScanHistoryItem } from '../../shared/types';

interface Props {
  item: ScanHistoryItem;
}

export function ScanItem({ item }: Props) {
  const [expanded, setExpanded] = useState(false);

  const verdictColors = {
    safe: 'bg-green-100 text-green-800',
    suspicious: 'bg-amber-100 text-amber-800',
    malicious: 'bg-red-100 text-red-800',
  };

  const timeAgo = getTimeAgo(item.timestamp);

  return (
    <div
      className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${verdictColors[item.verdict]}`}>
          {item.verdict}
        </span>
        <span className="text-xs text-gray-600 flex-1">{item.site}</span>
        <span className="text-[10px] text-gray-400">{timeAgo}</span>
      </div>

      {expanded && (
        <div className="mt-2 pl-2 border-l-2 border-gray-200 text-xs text-gray-500 space-y-1">
          <p><strong>Category:</strong> {item.category.replace(/_/g, ' ')}</p>
          <p><strong>Language:</strong> {item.language}</p>
          <p><strong>Preview:</strong> {item.textPreview}</p>
          {item.piiDetected.length > 0 && (
            <p><strong>PII:</strong> {item.piiDetected.map(p => p.label).join(', ')}</p>
          )}
          {item.offline && <p className="text-amber-600">⚡ Offline scan</p>}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
