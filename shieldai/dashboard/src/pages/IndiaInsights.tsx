import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import StatCard from '../components/StatCard';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const LANGUAGE_COLORS: Record<string, string> = {
  en: '#3B82F6',
  hi: '#F97316',
  'hi-en': '#8B5CF6',
  ta: '#10B981',
  te: '#14B8A6',
  bn: '#F43F5E',
  other: '#94A3B8',
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  'hi-en': 'Hinglish',
  ta: 'Tamil',
  te: 'Telugu',
  bn: 'Bengali',
  other: 'Other',
};

export default function IndiaInsights() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading India insights...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">Failed to load insights data.</p>
      </div>
    );
  }

  // Transform language distribution from stats
  const langDist = (stats?.language_distribution || []).map((item: any) => ({
    name: LANGUAGE_LABELS[item.language] || item.language,
    value: item.count,
    color: LANGUAGE_COLORS[item.language] || LANGUAGE_COLORS.other,
  }));

  // PII detection stats
  const piiStats = stats?.pii_stats || { aadhaar: 0, pan: 0, upi: 0, phone: 0, email: 0 };
  const piiData = Object.entries(piiStats)
    .filter(([_, count]) => (count as number) > 0)
    .map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      count: count as number,
    }));

  // Top attack patterns by category
  const categoryData = (stats?.category_distribution || [])
    .filter((c: any) => c.category?.includes('hindi') || c.category?.includes('hinglish') || c.category?.includes('tamil') || c.category?.includes('transliterated'))
    .map((c: any) => ({
      name: c.category?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      count: c.count,
    }));

  const totalScans = stats?.total_scans || 0;
  const indicScans = langDist
    .filter((l: any) => l.name !== 'English')
    .reduce((sum: number, l: any) => sum + l.value, 0);
  const piiTotal = Object.values(piiStats).reduce((sum: number, count) => sum + (count as number), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">India Insights</h1>
        <p className="text-sm text-gray-500 mt-1">Indian language threat analytics and PII detection</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Scans" value={totalScans.toLocaleString()} />
        <StatCard title="Indic Language Scans" value={indicScans.toLocaleString()} />
        <StatCard title="PII Detections" value={piiTotal.toLocaleString()} />
        <StatCard title="Languages Detected" value={langDist.length.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Language Distribution</h2>
          {langDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={langDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {langDist.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">No data yet</div>
          )}
        </div>

        {/* Indian PII detections */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Indian PII Detections</h2>
          {piiData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={piiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">No PII detected yet</div>
          )}
        </div>
      </div>

      {/* Indian language attack patterns */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Indian Language Attack Patterns</h2>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={200} />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            No Indian language attacks detected yet. Try the playground with Hindi/Hinglish prompts.
          </div>
        )}
      </div>

      {/* DPDP compliance quick status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">DPDP Compliance Quick Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="text-sm font-medium text-green-700">Input PII Scanning</div>
            <div className="text-2xl font-bold text-green-800 mt-1">Active</div>
            <div className="text-xs text-green-600 mt-1">Aadhaar, PAN, UPI, Phone</div>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="text-sm font-medium text-green-700">Data Retention</div>
            <div className="text-2xl font-bold text-green-800 mt-1">90 days</div>
            <div className="text-xs text-green-600 mt-1">Auto-purge enabled</div>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-sm font-medium text-blue-700">Regulatory Mapping</div>
            <div className="text-2xl font-bold text-blue-800 mt-1">DPDP + IT Act</div>
            <div className="text-xs text-blue-600 mt-1">Section references on every scan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
