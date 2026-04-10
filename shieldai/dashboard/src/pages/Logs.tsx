import { useState } from 'react';
import { useLogs } from '../hooks/useApi';
import ThreatLog from '../components/ThreatLog';

export default function Logs() {
  const [page, setPage] = useState(1);
  const [verdict, setVerdict] = useState<string>('');
  const { data, isLoading, error } = useLogs({ page, verdict: verdict || undefined });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scan Logs</h1>
        <p className="text-sm text-gray-500 mt-1">History of all prompt injection scans</p>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={verdict}
          onChange={(e) => { setVerdict(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-shield-500"
        >
          <option value="">All Verdicts</option>
          <option value="pass">Safe</option>
          <option value="flag">Suspicious</option>
          <option value="block">Malicious</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">Loading logs...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">Failed to load logs</div>
        ) : (
          <>
            <ThreatLog logs={data?.data || []} />
            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Page {data.page} of {data.total_pages} ({data.total} total)
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                    disabled={page >= data.total_pages}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
