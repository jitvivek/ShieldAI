interface Props {
  icon: string;
  label: string;
  value: number;
}

export function StatRow({ icon, label, value }: Props) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-lg font-bold text-gray-800">{value}</p>
        <p className="text-[10px] text-gray-500">{label}</p>
      </div>
    </div>
  );
}
