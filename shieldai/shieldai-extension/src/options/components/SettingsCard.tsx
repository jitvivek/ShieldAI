interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsCard({ title, description, children }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
      {description && <p className="text-xs text-gray-400 mb-4">{description}</p>}
      <div>{children}</div>
    </div>
  );
}
