import StatCard from '../components/StatCard';

export default function Overview() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Scans Today" value={0} color="teal" />
        <StatCard label="Blocked" value={0} color="red" />
        <StatCard label="Flagged" value={0} color="amber" />
        <StatCard label="PII Detected" value={0} color="purple" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Categories</h2>
          <p className="text-gray-500 text-sm">No scan data yet.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Language Distribution</h2>
          <p className="text-gray-500 text-sm">No scan data yet.</p>
        </div>
      </div>
    </div>
  );
}
