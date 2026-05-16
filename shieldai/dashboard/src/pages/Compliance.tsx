import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  compliant: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', label: 'Compliant', dot: 'bg-green-500' },
  needs_review: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', label: 'Needs Review', dot: 'bg-yellow-500' },
  violation: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', label: 'Violation', dot: 'bg-red-500' },
  not_applicable: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', label: 'N/A', dot: 'bg-gray-400' },
};

const INDUSTRIES = [
  { value: 'other', label: 'General / Other' },
  { value: 'banking', label: 'Banking' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'nbfc', label: 'NBFC' },
  { value: 'edtech', label: 'EdTech' },
  { value: 'capital_markets', label: 'Capital Markets' },
  { value: 'broking', label: 'Broking' },
];

export default function Compliance() {
  const [industry, setIndustry] = useState('other');

  const { data: status, isLoading, error } = useQuery({
    queryKey: ['compliance-status'],
    queryFn: api.getComplianceStatus,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading compliance status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">Failed to load compliance data.</p>
      </div>
    );
  }

  const regulations = status?.regulations || {};
  const dataRetention = status?.data_retention || {};
  const recommendations = status?.recommendations || [];
  const overallConfig = STATUS_CONFIG[status?.overall_status] || STATUS_CONFIG.compliant;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regulatory Compliance</h1>
          <p className="text-sm text-gray-500 mt-1">DPDP Act, IT Act, RBI & SEBI framework status</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Industry:</label>
          <select
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
          >
            {INDUSTRIES.map(ind => (
              <option key={ind.value} value={ind.value}>{ind.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall status */}
      <div className={`rounded-lg border p-6 ${overallConfig.bg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${overallConfig.dot}`} />
          <h2 className={`text-xl font-bold ${overallConfig.text}`}>
            Overall: {overallConfig.label}
          </h2>
        </div>
      </div>

      {/* Per-regulation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(regulations).map(([key, reg]: [string, any]) => {
          const config = STATUS_CONFIG[reg.status] || STATUS_CONFIG.compliant;
          return (
            <div key={key} className={`rounded-lg border p-4 ${config.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${config.dot}`} />
                <h3 className={`font-semibold ${config.text}`}>{formatRegName(key)}</h3>
              </div>
              <div className="text-sm text-gray-600">{reg.description}</div>
              {reg.violations_30d > 0 && (
                <div className="mt-2 text-sm">
                  <span className="font-medium text-red-700">{reg.violations_30d}</span>
                  <span className="text-gray-500"> violations (30d)</span>
                </div>
              )}
              {reg.sections_triggered?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {reg.sections_triggered.map((s: string) => (
                    <span key={s} className="text-xs bg-white/50 px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              )}
              {reg.reason && (
                <div className="mt-2 text-xs text-gray-500 italic">{reg.reason}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Data retention */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Retention (DPDP Compliance)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500">Policy</div>
            <div className="text-lg font-bold">{dataRetention.policy_days || 90} days</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500">Oldest Log</div>
            <div className="text-lg font-bold">
              {dataRetention.oldest_log
                ? new Date(dataRetention.oldest_log).toLocaleDateString()
                : 'None'}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500">Next Purge</div>
            <div className="text-lg font-bold">
              {dataRetention.next_purge
                ? new Date(dataRetention.next_purge).toLocaleDateString()
                : 'N/A'}
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500">Logs Pending Purge</div>
            <div className="text-lg font-bold">{dataRetention.logs_pending_purge || 0}</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Recommendations</h2>
          <ul className="space-y-2">
            {recommendations.map((rec: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                <span className="mt-0.5">💡</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Download button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            api.getComplianceReport().then(report => {
              const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `compliance-report-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Download Compliance Report
        </button>
      </div>
    </div>
  );
}

function formatRegName(key: string): string {
  const names: Record<string, string> = {
    dpdp_act: 'DPDP Act 2023',
    it_act: 'IT Act 2000',
    it_rules_2021: 'IT Rules 2021',
    rbi_framework: 'RBI AI Framework',
    sebi_circular: 'SEBI AI Circular',
  };
  return names[key] || key;
}
