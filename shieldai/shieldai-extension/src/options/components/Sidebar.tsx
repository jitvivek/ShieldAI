interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'protection', label: 'Protection', icon: '🛡️' },
  { id: 'blockRules', label: 'Block Rules', icon: '🚫' },
  { id: 'parental', label: 'Parental Controls', icon: '👨‍👩‍👧' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
];

export function Sidebar({ activePage, onNavigate }: Props) {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-shield-safe flex items-center gap-2">
          🛡️ ShieldAI Guard
        </h1>
        <p className="text-xs text-gray-400 mt-1">Settings</p>
      </div>
      <nav className="flex-1 py-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${
              activePage === item.id
                ? 'bg-teal-50 text-shield-safe font-medium border-r-2 border-shield-safe'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
