import { useEffect, useState } from 'react';
import { SettingsCard } from '../components/SettingsCard';
import { DEFAULT_SETTINGS } from '../../shared/constants';
import type { ExtensionSettings } from '../../shared/types';

export default function Notifications() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) setSettings({ ...DEFAULT_SETTINGS, ...result.settings });
    });
  }, []);

  const save = (updated: ExtensionSettings) => {
    setSettings(updated);
    chrome.storage.sync.set({ settings: updated });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Notifications</h2>

      <SettingsCard title="Alert Preferences" description="Configure how you're notified about blocked or flagged content">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-gray-700">Desktop notifications</p>
              <p className="text-xs text-gray-400">Show system notification when content is blocked</p>
            </div>
            <button
              onClick={() => save({ ...settings, notifications: !settings.notifications })}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings.notifications ? 'bg-shield-safe' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.notifications ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-gray-700">Badge counter</p>
              <p className="text-xs text-gray-400">Show number of blocks today on extension icon</p>
            </div>
            <button
              onClick={() => save({ ...settings, badgeCounter: !settings.badgeCounter })}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings.badgeCounter ? 'bg-shield-safe' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.badgeCounter ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
