const SEVERITY_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  critical: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: '🚨' },
  high: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800', icon: '⚠️' },
  medium: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', icon: '📋' },
};

interface PiiMatch {
  type: string;
  value: string;
  severity: string;
  dpdp_section: string;
  validated: boolean;
}

interface PiiAlertProps {
  matches: PiiMatch[];
  compact?: boolean;
}

const PII_LABELS: Record<string, string> = {
  aadhaar: 'Aadhaar Number',
  pan: 'PAN Card',
  upi_id: 'UPI ID',
  ifsc: 'IFSC Code',
  indian_phone: 'Phone Number',
  indian_passport: 'Passport',
  voter_id_epic: 'Voter ID',
  indian_bank_account: 'Bank Account',
  email: 'Email Address',
  credit_card: 'Credit Card',
};

export default function PiiAlert({ matches, compact = false }: PiiAlertProps) {
  if (!matches || matches.length === 0) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-medium">
        🔒 {matches.length} PII
      </span>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔒</span>
        <h3 className="font-semibold text-red-800">Indian PII Detected ({matches.length})</h3>
      </div>
      <div className="space-y-2">
        {matches.map((match, i) => {
          const config = SEVERITY_CONFIG[match.severity] || SEVERITY_CONFIG.medium;
          return (
            <div key={i} className={`flex items-center justify-between p-2 rounded border ${config.bg}`}>
              <div className="flex items-center gap-2">
                <span>{config.icon}</span>
                <span className={`font-medium ${config.text}`}>
                  {PII_LABELS[match.type] || match.type}
                </span>
                <code className="text-xs bg-white/50 px-2 py-0.5 rounded">{match.value}</code>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>{match.dpdp_section}</span>
                {match.validated && (
                  <span className="text-green-600" title="Checksum validated">✓</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
