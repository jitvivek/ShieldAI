import { useState } from 'react';
import Status from './pages/Status';
import History from './pages/History';
import QuickSettings from './pages/QuickSettings';

type Tab = 'status' | 'history' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('status');

  return (
    <div className="w-[400px] h-[500px] bg-white flex flex-col">
      {/* Header */}
      <div className="bg-shield-safe text-white px-4 py-3 flex items-center gap-2">
        <span className="text-xl">🛡️</span>
        <h1 className="text-base font-semibold">ShieldAI Guard</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'status' && <Status />}
        {tab === 'history' && <History />}
        {tab === 'settings' && <QuickSettings />}
      </div>

      {/* Tab bar */}
      <div className="flex border-t border-gray-200">
        <TabButton active={tab === 'status'} onClick={() => setTab('status')} label="Status" icon="📊" />
        <TabButton active={tab === 'history'} onClick={() => setTab('history')} label="History" icon="📋" />
        <TabButton active={tab === 'settings'} onClick={() => setTab('settings')} label="Settings" icon="⚙️" />
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-xs flex flex-col items-center gap-0.5 ${active ? 'text-shield-safe border-t-2 border-shield-safe' : 'text-gray-500'}`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}
