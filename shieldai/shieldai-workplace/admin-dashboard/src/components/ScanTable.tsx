interface ScanLog {
  id: string;
  platform: string;
  verdict: string;
  category: string;
  actionTaken: string;
  createdAt: string;
}

interface ScanTableProps {
  logs: ScanLog[];
}

const verdictColors: Record<string, string> = {
  safe: 'bg-green-100 text-green-800',
  suspicious: 'bg-amber-100 text-amber-800',
  malicious: 'bg-red-100 text-red-800',
};

export default function ScanTable({ logs }: ScanTableProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        <p>No scan logs yet. Logs will appear here once messages are scanned.</p>
        <button className="mt-4 text-sm text-teal-600 hover:underline">Export CSV</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">Platform</th>
            <th className="px-4 py-3 text-left">Verdict</th>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-left">Action</th>
            <th className="px-4 py-3 text-left">Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t">
              <td className="px-4 py-3">{log.platform}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${verdictColors[log.verdict] || ''}`}>
                  {log.verdict}
                </span>
              </td>
              <td className="px-4 py-3">{log.category}</td>
              <td className="px-4 py-3">{log.actionTaken}</td>
              <td className="px-4 py-3 text-gray-500">{log.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
