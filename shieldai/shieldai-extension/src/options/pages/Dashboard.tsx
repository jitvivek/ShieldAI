import { SettingsCard } from '../components/SettingsCard';

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Dashboard</h2>

      <SettingsCard title="Full Dashboard" description="Access the complete ShieldAI analytics dashboard">
        <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
          <iframe
            src="https://app.shieldai.dev/dashboard"
            className="w-full h-full border-0"
            title="ShieldAI Dashboard"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Dashboard requires an active ShieldAI account. Sign up at shieldai.dev
        </p>
      </SettingsCard>
    </div>
  );
}
