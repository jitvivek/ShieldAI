import { useEffect, useState } from 'react';
import { SettingsCard } from '../components/SettingsCard';
import { PinLock } from '../components/PinLock';
import { DEFAULT_SETTINGS } from '../../shared/constants';
import type { ExtensionSettings } from '../../shared/types';

export default function ParentalControls() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) setSettings({ ...DEFAULT_SETTINGS, ...result.settings });
    });
  }, []);

  const save = (updated: ExtensionSettings) => {
    setSettings(updated);
    chrome.storage.sync.set({ settings: updated });
  };

  const verifyPin = (pin: string) => {
    return pin === settings.parentalControls.pin;
  };

  const hasPin = settings.parentalControls.pin.length === 4;

  const content = (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Parental Controls</h2>

      <SettingsCard title="Supervised Mode" description="When enabled, the child cannot change settings or disable the extension">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-700">Enable supervised mode</span>
          <button
            onClick={() => save({
              ...settings,
              parentalControls: { ...settings.parentalControls, enabled: !settings.parentalControls.enabled },
            })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              settings.parentalControls.enabled ? 'bg-shield-safe' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              settings.parentalControls.enabled ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title="PIN Lock" description="Set a 4-digit PIN to protect settings from being changed">
        <div className="flex gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {hasPin ? 'Change PIN' : 'Set PIN'}
            </label>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-center tracking-widest"
            />
          </div>
          <button
            onClick={() => {
              if (newPin.length === 4) {
                save({ ...settings, parentalControls: { ...settings.parentalControls, pin: newPin } });
                setNewPin('');
              }
            }}
            disabled={newPin.length !== 4}
            className="bg-shield-safe text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            Save PIN
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title="Age Tier" description="Adjust content filtering based on child's age group">
        <select
          value={settings.parentalControls.ageTier}
          onChange={(e) => save({
            ...settings,
            parentalControls: { ...settings.parentalControls, ageTier: e.target.value as ExtensionSettings['parentalControls']['ageTier'] },
          })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="8-12">Young (8-12) — Most restrictive</option>
          <option value="13-15">Teen (13-15) — Moderate</option>
          <option value="16-17">Older teen (16-17) — Light</option>
          <option value="adult">Adult — Standard protection</option>
        </select>
      </SettingsCard>

      <SettingsCard title="Activity Logging" description="Log all AI interactions for parent review">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Enable activity logging</span>
            <button
              onClick={() => save({
                ...settings,
                parentalControls: { ...settings.parentalControls, activityLogging: !settings.parentalControls.activityLogging },
              })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.parentalControls.activityLogging ? 'bg-shield-safe' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                settings.parentalControls.activityLogging ? 'translate-x-5' : ''
              }`} />
            </button>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Parent email (for weekly reports)</label>
            <input
              type="email"
              value={settings.parentalControls.parentEmail}
              onChange={(e) => save({
                ...settings,
                parentalControls: { ...settings.parentalControls, parentEmail: e.target.value },
              })}
              placeholder="parent@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </SettingsCard>
    </div>
  );

  // If parental controls are enabled and PIN is set, require PIN
  if (hasPin && settings.parentalControls.enabled) {
    return <PinLock onVerify={verifyPin}>{content}</PinLock>;
  }

  return content;
}
