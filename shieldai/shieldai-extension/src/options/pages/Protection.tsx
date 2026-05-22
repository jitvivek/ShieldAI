import { useEffect, useState } from 'react';
import { SettingsCard } from '../components/SettingsCard';
import { DEFAULT_SETTINGS } from '../../shared/constants';
import type { ExtensionSettings } from '../../shared/types';

export default function Protection() {
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

  const ToggleRow = ({ label, description, checked, onChange }: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-shield-safe' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Protection Settings</h2>

      <SettingsCard title="Detection Categories" description="Toggle which types of threats to scan for">
        <ToggleRow
          label="PII Protection"
          description="Block Aadhaar, PAN, UPI, credit card, phone, email from being sent to AI"
          checked={settings.piiProtection}
          onChange={(v) => save({ ...settings, piiProtection: v })}
        />
        <ToggleRow
          label="Harmful Content Filter"
          description="Block requests for weapons, drugs, violence, self-harm, exploitation"
          checked={settings.harmfulContentFilter}
          onChange={(v) => save({ ...settings, harmfulContentFilter: v })}
        />
        <ToggleRow
          label="Injection Detection"
          description="Detect prompt injection, jailbreak, roleplay exploits"
          checked={settings.injectionDetection}
          onChange={(v) => save({ ...settings, injectionDetection: v })}
        />
        <ToggleRow
          label="Hindi/Hinglish Detection"
          description="Detect attacks in Hindi (Devanagari), Hinglish (Latin), and Tamil"
          checked={settings.hindiHinglishDetection}
          onChange={(v) => save({ ...settings, hindiHinglishDetection: v })}
        />
      </SettingsCard>
    </div>
  );
}
