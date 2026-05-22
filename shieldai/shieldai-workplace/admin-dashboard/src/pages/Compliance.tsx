import ComplianceBadge from '../components/ComplianceBadge';

export default function Compliance() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">DPDP Compliance</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center gap-4">
          <ComplianceBadge status="compliant" />
          <div>
            <div className="font-semibold">Overall Status</div>
            <div className="text-sm text-gray-500">All data processing compliant with DPDP Act 2023</div>
          </div>
        </div>
        <div className="border-t pt-4">
          <h2 className="font-semibold mb-3">Compliance Checklist</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> User data hashed in logs</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> PII masked before storage</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Data processed in India</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Retention policy configured</li>
          </ul>
        </div>
        <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 text-sm">
          Download Audit Report (PDF)
        </button>
      </div>
    </div>
  );
}
