import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/playground', label: 'Playground', icon: '🧪' },
  { path: '/guards', label: 'Guardrails', icon: '🛡️' },
  { path: '/policies', label: 'Policies', icon: '📜' },
  { path: '/threat-feed', label: 'Threat Feed', icon: '⚡' },
  { path: '/logs', label: 'Scan Logs', icon: '📋' },
  { path: '/api-keys', label: 'API Keys', icon: '🔑' },
  { path: '/india-insights', label: 'India Insights', icon: '🇮🇳' },
  { path: '/compliance', label: 'Compliance', icon: '⚖️' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-shield-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-bold text-gray-900">ShieldAI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors ${
                isActive
                  ? 'bg-shield-50 text-shield-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span className="mr-3 text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">ShieldAI v2.0.0</p>
        <p className="text-xs text-gray-400">The trust layer for LLMs</p>
      </div>
    </aside>
  );
}
