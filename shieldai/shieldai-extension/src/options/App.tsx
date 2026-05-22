import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import General from './pages/General';
import Protection from './pages/Protection';
import BlockRules from './pages/BlockRules';
import ParentalControls from './pages/ParentalControls';
import Notifications from './pages/Notifications';
import Dashboard from './pages/Dashboard';

type Page = 'general' | 'protection' | 'blockRules' | 'parental' | 'notifications' | 'dashboard';

export default function App() {
  const [page, setPage] = useState<Page>('general');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage={page} onNavigate={(p) => setPage(p as Page)} />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          {page === 'general' && <General />}
          {page === 'protection' && <Protection />}
          {page === 'blockRules' && <BlockRules />}
          {page === 'parental' && <ParentalControls />}
          {page === 'notifications' && <Notifications />}
          {page === 'dashboard' && <Dashboard />}
        </div>
      </main>
    </div>
  );
}
