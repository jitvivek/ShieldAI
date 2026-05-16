import Footer from '@/components/Footer';

export const metadata = {
  title: 'API Documentation — ShieldAI',
  description: 'Complete API reference for ShieldAI prompt injection detection.',
};

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/v1/detect',
    description: 'Scan a prompt for injection, jailbreak, and PII.',
    body: '{ "input": "string", "config": { "threshold": 0.7 } }',
    response: `{
  "requestId": "req_abc123",
  "verdict": "BLOCK",
  "riskScore": 0.94,
  "category": "direct_injection",
  "detectedLanguage": "hi",
  "breakdown": { ... },
  "latencyMs": 42
}`,
  },
  {
    method: 'GET',
    path: '/v1/health',
    description: 'Check API and service health.',
    body: null,
    response: '{ "status": "healthy", "services": { "postgres": true, "redis": true, "ml": true } }',
  },
  {
    method: 'GET',
    path: '/v1/compliance/status',
    description: 'Get regulatory compliance status for your account.',
    body: null,
    response: '{ "overall_status": "compliant", "regulations": { ... } }',
  },
  {
    method: 'GET',
    path: '/v1/compliance/report',
    description: 'Generate a compliance report.',
    body: null,
    response: '{ "period": "2026-05", "regulations": { ... }, "recommendations": [...] }',
  },
];

export default function DocsPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-shield-900 to-shield-700 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">API Documentation</h1>
        <p className="mt-3 text-shield-100">Everything you need to integrate ShieldAI.</p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-2xl font-bold">Authentication</h2>
        <p className="mt-2 text-gray-600">
          All API requests require a Bearer token in the Authorization header:
        </p>
        <pre className="mt-3 rounded-lg bg-gray-900 p-4 text-sm text-green-300">
          Authorization: Bearer sk_live_your_api_key
        </pre>

        <h2 className="mt-12 text-2xl font-bold">Base URL</h2>
        <pre className="mt-3 rounded-lg bg-gray-900 p-4 text-sm text-green-300">
          https://api.shieldai.dev
        </pre>

        <h2 className="mt-12 text-2xl font-bold">Endpoints</h2>
        <div className="mt-6 space-y-8">
          {ENDPOINTS.map((ep) => (
            <div key={ep.path} className="rounded-xl border p-6">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    ep.method === 'POST'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {ep.method}
                </span>
                <code className="font-mono text-sm">{ep.path}</code>
              </div>
              <p className="mt-2 text-gray-600">{ep.description}</p>
              {ep.body && (
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase text-gray-400">Request Body</div>
                  <pre className="mt-1 rounded bg-gray-50 p-3 text-xs">{ep.body}</pre>
                </div>
              )}
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase text-gray-400">Response</div>
                <pre className="mt-1 rounded bg-gray-50 p-3 text-xs">{ep.response}</pre>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-bold">Rate Limits</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2">Plan</th>
              <th>Requests/min</th>
              <th>Monthly Scans</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="py-2">Free</td><td>10</td><td>1,000</td></tr>
            <tr className="border-b"><td className="py-2">Starter</td><td>60</td><td>25,000</td></tr>
            <tr className="border-b"><td className="py-2">Growth</td><td>300</td><td>250,000</td></tr>
            <tr><td className="py-2">Enterprise</td><td>Custom</td><td>Unlimited</td></tr>
          </tbody>
        </table>
      </section>
      <Footer />
    </main>
  );
}
