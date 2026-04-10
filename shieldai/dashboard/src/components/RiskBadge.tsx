interface RiskBadgeProps {
  verdict: 'pass' | 'flag' | 'block' | string;
  size?: 'sm' | 'md';
}

const verdictConfig: Record<string, { bg: string; text: string; label: string }> = {
  pass: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Safe' },
  safe: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Safe' },
  flag: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Suspicious' },
  suspicious: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Suspicious' },
  block: { bg: 'bg-red-100', text: 'text-red-700', label: 'Malicious' },
  malicious: { bg: 'bg-red-100', text: 'text-red-700', label: 'Malicious' },
};

export default function RiskBadge({ verdict, size = 'md' }: RiskBadgeProps) {
  const config = verdictConfig[verdict] || verdictConfig['pass']!;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.text} ${sizeClass}`}>
      {config.label}
    </span>
  );
}
