const LANGUAGE_CONFIG: Record<string, { label: string; color: string; flag: string }> = {
  en: { label: 'English', color: 'bg-blue-100 text-blue-700', flag: '🇬🇧' },
  hi: { label: 'Hindi', color: 'bg-orange-100 text-orange-700', flag: '🇮🇳' },
  'hi-en': { label: 'Hinglish', color: 'bg-purple-100 text-purple-700', flag: '🇮🇳' },
  ta: { label: 'Tamil', color: 'bg-green-100 text-green-700', flag: '🇮🇳' },
  te: { label: 'Telugu', color: 'bg-teal-100 text-teal-700', flag: '🇮🇳' },
  bn: { label: 'Bengali', color: 'bg-rose-100 text-rose-700', flag: '🇮🇳' },
  mr: { label: 'Marathi', color: 'bg-amber-100 text-amber-700', flag: '🇮🇳' },
  gu: { label: 'Gujarati', color: 'bg-lime-100 text-lime-700', flag: '🇮🇳' },
  kn: { label: 'Kannada', color: 'bg-cyan-100 text-cyan-700', flag: '🇮🇳' },
  ml: { label: 'Malayalam', color: 'bg-indigo-100 text-indigo-700', flag: '🇮🇳' },
};

interface LanguageBadgeProps {
  language: string;
  isCodeMixed?: boolean;
  size?: 'sm' | 'md';
}

export default function LanguageBadge({ language, isCodeMixed, size = 'md' }: LanguageBadgeProps) {
  const config = LANGUAGE_CONFIG[language] || { label: language.toUpperCase(), color: 'bg-gray-100 text-gray-700', flag: '🌐' };
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.color} ${sizeClass}`}>
      <span>{config.flag}</span>
      <span>{config.label}</span>
      {isCodeMixed && (
        <span className="ml-1 text-xs opacity-75">(mixed)</span>
      )}
    </span>
  );
}
