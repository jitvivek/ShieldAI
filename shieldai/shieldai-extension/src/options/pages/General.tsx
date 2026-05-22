import { useEffect, useState } from 'react';
import { SettingsCard } from '../components/SettingsCard';
import { DEFAULT_SETTINGS } from '../../shared/constants';
import type { ExtensionSettings } from '../../shared/types';

export default function General() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) setSettings({ ...DEFAULT_SETTINGS, ...result.settings });
    });
  }, []);

  useEffect(() => {
    checkConnection();
  }, [settings.apiKey, settings.apiUrl]);

  const checkConnection = async () => {
    if (!settings.apiKey) {
      setConnectionStatus('disconnected');
      return;
    }
    setConnectionStatus('checking');
    try {
      const resp = await fetch(`${settings.apiUrl}/health`, { signal: AbortSignal.timeout(3000) });
      setConnectionStatus(resp.ok ? 'connected' : 'disconnected');
    } catch {
      setConnectionStatus('disconnected');
    }
  };

  const save = (updated: ExtensionSettings) => {
    setSettings(updated);
    chrome.storage.sync.set({ settings: updated });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">General Settings</h2>

      <SettingsCard title="API Configuration" description="Connect to ShieldAI cloud for full ML-powered detection">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">API Key</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => save({ ...settings, apiKey: e.target.value })}
              placeholder="sk-shield-..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">API URL</label>
            <input
              type="text"
              value={settings.apiUrl}
              onChange={(e) => save({ ...settings, apiUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Connection Status">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
            'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600">
            {connectionStatus === 'connected' && 'Connected to ShieldAI API'}
            {connectionStatus === 'checking' && 'Checking connection...'}
            {connectionStatus === 'disconnected' && 'Disconnected — running in offline mode'}
          </span>
        </div>
      </SettingsCard>

      <SettingsCard title="Account" description="Your subscription tier determines scan limits and features">
        <div className="text-sm text-gray-600">
          <p>Tier: {settings.apiKey ? 'Premium' : 'Free (50 scans/day)'}</p>
          <p className="text-xs text-gray-400 mt-1">Upgrade at shieldai.dev for unlimited ML-powered detection</p>
        </div>
      </SettingsCard>
    </div>
  );
}
