import { useState } from 'react';
import Overview from './pages/Overview';
import Policies from './pages/Policies';
import ScanLogs from './pages/ScanLogs';
import PIIReport from './pages/PIIReport';
import Compliance from './pages/Compliance';
import Settings from './pages/Settings';

type Page = 'overview' | 'policies' | 'scan-logs' | 'pii-report' | 'compliance' | 'settings';

const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'policies', label: 'Policies' },
  { id: 'scan-logs', label: 'Scan Logs' },
  { id: 'pii-report', label: 'PII Report' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'settings', label: 'Settings' },
];

export default function App() {
  const [page, setPage] = useState<Page>('overview');

  return (
    <div className="flex min-h-screen">
      <nav className="w-56 bg-gray-900 text-white p-4 space-y-1">
        <div className="text-lg font-bold text-teal-400 mb-6">🛡️ ShieldAI</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`block w-full text-left px-3 py-2 rounded text-sm ${
              page === item.id ? 'bg-teal-700 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <main className="flex-1 p-6">
        {page === 'overview' && <Overview />}
        {page === 'policies' && <Policies />}
        {page === 'scan-logs' && <ScanLogs />}
        {page === 'pii-report' && <PIIReport />}
        {page === 'compliance' && <Compliance />}
        {page === 'settings' && <Settings />}
      </main>
    </div>
  );
}
