interface Props {
  status: 'safe' | 'warning' | 'blocked';
}

export function ShieldBadge({ status }: Props) {
  const colors = {
    safe: 'text-shield-safe',
    warning: 'text-shield-warning',
    blocked: 'text-shield-blocked',
  };

  const bgColors = {
    safe: 'bg-teal-50',
    warning: 'bg-amber-50',
    blocked: 'bg-red-50',
  };

  return (
    <div className={`w-16 h-16 rounded-full ${bgColors[status]} flex items-center justify-center`}>
      <span className={`text-3xl ${colors[status]}`}>🛡️</span>
    </div>
  );
}
