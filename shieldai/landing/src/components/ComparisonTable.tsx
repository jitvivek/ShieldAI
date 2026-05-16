const FEATURES = [
  'Hindi injection detection',
  'Hinglish code-mixed attacks',
  'Tamil/Telugu/Bengali support',
  'Aadhaar/PAN/UPI PII scanning',
  'DPDP Act compliance mapping',
  'India pricing (from ₹2,900/mo)',
  'Prompt injection detection',
  'Content moderation',
  'Automated red-teaming',
];

const COMPETITORS = [
  {
    name: 'Lakera (Check Point)',
    highlight: false,
    values: ['❌', '❌', '❌', '❌', '❌', '❌', '✅', '✅', '✅'],
  },
  {
    name: 'Promptfoo',
    highlight: false,
    values: ['❌', '❌', '❌', '❌', '❌', 'Free (OSS)', '✅', '✅', '✅'],
  },
  {
    name: 'NeMo Guardrails',
    highlight: false,
    values: ['❌', '❌', '❌', '❌', '❌', 'Free (OSS)', '✅', '✅', '❌'],
  },
  {
    name: 'ShieldAI',
    highlight: true,
    values: ['✅', '✅', '✅', '✅', '✅', '✅', '✅', 'Phase 4', 'Phase 6'],
  },
];

export default function ComparisonTable() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-3xl font-bold">How ShieldAI Compares</h2>
        <p className="mt-3 text-gray-500">The only platform with native Indic language and DPDP compliance.</p>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-3 pr-4">Feature</th>
                {COMPETITORS.map((c) => (
                  <th
                    key={c.name}
                    className={`px-3 py-3 text-center ${c.highlight ? 'text-shield-700 font-bold' : ''}`}
                  >
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feat, i) => (
                <tr key={feat} className="border-b">
                  <td className="py-2.5 pr-4 font-medium">{feat}</td>
                  {COMPETITORS.map((c) => (
                    <td key={c.name} className="px-3 py-2.5 text-center">
                      {c.values[i]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
