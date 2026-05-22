import { useEffect, useState } from 'react';
import { SettingsCard } from '../components/SettingsCard';

export default function BlockRules() {
  const [keywords, setKeywords] = useState('');
  const [regexPatterns, setRegexPatterns] = useState('');

  useEffect(() => {
    chrome.storage.sync.get(['customBlockRules'], (result) => {
      if (result.customBlockRules) {
        setKeywords(result.customBlockRules.keywords || '');
        setRegexPatterns(result.customBlockRules.patterns || '');
      }
    });
  }, []);

  const save = () => {
    chrome.storage.sync.set({
      customBlockRules: { keywords, patterns: regexPatterns },
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Custom Block Rules</h2>

      <SettingsCard title="Keywords" description="Messages containing these words/phrases will be blocked. One per line.">
        <textarea
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          onBlur={save}
          placeholder="company secret&#10;internal project&#10;confidential"
          className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono resize-y"
        />
      </SettingsCard>

      <SettingsCard title="Regex Patterns" description="Advanced: Custom regex patterns. One per line. Invalid patterns are skipped.">
        <textarea
          value={regexPatterns}
          onChange={(e) => setRegexPatterns(e.target.value)}
          onBlur={save}
          placeholder="customer\s+id:\s*\d+&#10;project-[A-Z]{3}-\d{4}"
          className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono resize-y"
        />
        <p className="text-xs text-gray-400 mt-2">
          Use standard JavaScript regex syntax. Case-insensitive matching is applied automatically.
        </p>
      </SettingsCard>
    </div>
  );
}
