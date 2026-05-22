import { useEffect, useState } from 'react';
import { Toggle } from '../components/Toggle';
import { DEFAULT_SETTINGS } from '../../shared/constants';
import type { ExtensionSettings } from '../../shared/types';

export default function QuickSettings() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) setSettings({ ...DEFAULT_SETTINGS, ...result.settings });
    });
  }, []);

  const updateSetting = <K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    chrome.storage.sync.set({ settings: updated });
  };

  return (
    <div className="p-4 space-y-3">
      <Toggle
        label="PII Protection"
        description="Block Aadhaar, PAN, UPI, phone numbers"
        checked={settings.piiProtection}
        onChange={(v) => updateSetting('piiProtection', v)}
      />
      <Toggle
        label="Harmful Content Filter"
        description="Block weapons, drugs, self-harm content"
        checked={settings.harmfulContentFilter}
        onChange={(v) => updateSetting('harmfulContentFilter', v)}
      />
      <Toggle
        label="Injection Detection"
        description="Detect prompt injection attacks"
        checked={settings.injectionDetection}
        onChange={(v) => updateSetting('injectionDetection', v)}
      />
      <Toggle
        label="Hindi/Hinglish Detection"
        description="Detect attacks in Indian languages"
        checked={settings.hindiHinglishDetection}
        onChange={(v) => updateSetting('hindiHinglishDetection', v)}
      />

      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        className="w-full mt-4 text-sm text-shield-safe hover:underline"
      >
        Open full settings →
      </button>
    </div>
  );
}
