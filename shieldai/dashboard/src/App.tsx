import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Playground from './pages/Playground';
import Logs from './pages/Logs';
import ApiKeys from './pages/ApiKeys';
// PHASE 2 ADDITION
import Guards from './pages/Guards';
import Policies from './pages/Policies';
import ThreatFeed from './pages/ThreatFeed';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/guards" element={<Guards />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/threat-feed" element={<ThreatFeed />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/api-keys" element={<ApiKeys />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
