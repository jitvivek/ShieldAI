interface ComplianceBadgeProps {
  status: 'compliant' | 'warning' | 'non_compliant';
}

const statusConfig = {
  compliant: { bg: 'bg-green-100', text: 'text-green-800', label: 'Compliant' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Needs Attention' },
  non_compliant: { bg: 'bg-red-100', text: 'text-red-800', label: 'Non-Compliant' },
};

export default function ComplianceBadge({ status }: ComplianceBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
