import { useStats } from '../hooks/useApi';
import StatCard from '../components/StatCard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const VERDICT_COLORS = {
  pass: '#10B981',
  safe: '#10B981',
  flag: '#F59E0B',
  suspicious: '#F59E0B',
  block: '#EF4444',
  malicious: '#EF4444',
};

export default function Dashboard() {
  const { data, isLoading, error } = useStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">
          Failed to load dashboard data. Make sure the API is running and you have a valid API key set.
        </p>
        <p className="text-sm text-red-500 mt-2">
          Set your API key in the browser console: localStorage.setItem('shieldai_api_key', 'sk-shield-yourkey')
        </p>
      </div>
    );
  }

  const verdictData = (data?.verdict_distribution || []).map((v: any) => ({
    name: v.verdict === 'pass' ? 'Safe' : v.verdict === 'flag' ? 'Suspicious' : 'Malicious',
    value: v.count,
    color: VERDICT_COLORS[v.verdict as keyof typeof VERDICT_COLORS] || '#94A3B8',
  }));

  const dailyData = (data?.daily_scans || []).map((d: any) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    scans: d.count,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of prompt injection detection activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Total Scans (24h)" value={data?.total_scans_24h || 0} color="blue" />
        <StatCard title="Blocked" value={data?.blocked_24h || 0} color="red" />
        <StatCard title="Flagged" value={data?.flagged_24h || 0} color="yellow" />
        <StatCard
          title="Avg Latency"
          value={`${data?.avg_latency_ms || 0}ms`}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Line chart: Scans over time */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Scans Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="scans"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart: Verdict distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Verdict Distribution</h3>
          {verdictData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={verdictData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {verdictData.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">
              No data yet
            </div>
          )}
          <div className="flex justify-center space-x-4 mt-2">
            {verdictData.map((entry: any) => (
              <div key={entry.name} className="flex items-center space-x-1 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
