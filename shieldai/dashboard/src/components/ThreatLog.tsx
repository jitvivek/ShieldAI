import RiskBadge from './RiskBadge';

interface LogEntry {
  id: string;
  requestId: string;
  verdict: string;
  riskScore: number;
  category: string | null;
  latencyMs: number;
  createdAt: string;
}

interface ThreatLogProps {
  logs: LogEntry[];
}

export default function ThreatLog({ logs }: ThreatLogProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No scan logs yet. Try scanning a prompt in the Playground.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-500">Time</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Verdict</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Risk Score</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Latency</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-gray-600">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="py-3 px-4">
                <RiskBadge verdict={log.verdict} size="sm" />
              </td>
              <td className="py-3 px-4">
                <span className="font-mono text-gray-700">{log.riskScore.toFixed(2)}</span>
              </td>
              <td className="py-3 px-4 text-gray-600">
                {log.category?.replace(/_/g, ' ') || '—'}
              </td>
              <td className="py-3 px-4 text-gray-500">{log.latencyMs}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
