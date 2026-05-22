interface StatCardProps {
  label: string;
  value: number;
  color: 'teal' | 'red' | 'amber' | 'purple';
}

const colorMap = {
  teal: 'text-teal-600 bg-teal-50',
  red: 'text-red-600 bg-red-50',
  amber: 'text-amber-600 bg-amber-50',
  purple: 'text-purple-600 bg-purple-50',
};

export default function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className={`rounded-lg shadow p-4 ${colorMap[color]}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm mt-1 opacity-75">{label}</div>
    </div>
  );
}
