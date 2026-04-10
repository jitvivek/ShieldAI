import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function Guards() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [policyName, setPolicyName] = useState('');

  const guardMutation = useMutation({
    mutationFn: (data: { input: string; output?: string; policy?: string; system_prompt?: string }) =>
      api.guard(data),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    guardMutation.mutate({
      input,
      output: output || undefined,
      policy: policyName || undefined,
      system_prompt: systemPrompt || undefined,
    });
  };

  const result = guardMutation.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Guardrails</h1>
        <p className="text-sm text-gray-500 mt-1">
          Test bidirectional guardrails — scan both input and LLM output
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Guard Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Input</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter user prompt to scan..."
                className="w-full h-24 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-shield-500 focus:border-shield-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LLM Output <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder="Paste LLM response to scan for policy violations..."
                className="w-full h-24 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-shield-500 focus:border-shield-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Prompt <span className="text-gray-400">(for leak detection)</span>
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Paste your system prompt for leak detection..."
                className="w-full h-16 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-shield-500 focus:border-shield-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="e.g., default, strict, permissive"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-shield-500 focus:border-shield-500"
              />
            </div>
            <button
              type="submit"
              disabled={guardMutation.isPending}
              className="w-full bg-shield-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-shield-700 disabled:opacity-50"
            >
              {guardMutation.isPending ? 'Scanning...' : 'Run Guard'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Guard Results</h2>
          {guardMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {(guardMutation.error as Error).message}
            </div>
          )}
          {result && (
            <div className="space-y-4">
              {/* Input Verdict */}
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Input Verdict</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.input_verdict.verdict === 'pass'
                        ? 'bg-green-100 text-green-800'
                        : result.input_verdict.verdict === 'flag'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result.input_verdict.verdict.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">
                    Risk: {(result.input_verdict.risk_score * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">{result.input_verdict.explanation}</p>
                {result.input_verdict.jailbreak_label && (
                  <p className="text-xs text-purple-600 mt-1">
                    Jailbreak: {result.input_verdict.jailbreak_label} ({(result.input_verdict.jailbreak_score! * 100).toFixed(0)}%)
                  </p>
                )}
              </div>

              {/* Output Verdict */}
              {result.output_verdict && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Output Verdict</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.output_verdict.verdict === 'pass'
                          ? 'bg-green-100 text-green-800'
                          : result.output_verdict.verdict === 'flag'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.output_verdict.verdict.toUpperCase()}
                    </span>
                  </div>
                  {result.output_verdict.piiDetected.length > 0 && (
                    <p className="text-xs text-orange-600">
                      PII detected: {result.output_verdict.piiDetected.map((p: any) => p.type).join(', ')}
                    </p>
                  )}
                  {result.output_verdict.canaryDetected && (
                    <p className="text-xs text-red-600 font-semibold">⚠️ Canary token detected in output!</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Prompt leak score: {(result.output_verdict.promptLeakScore * 100).toFixed(1)}%
                  </p>
                </div>
              )}

              {/* Policy Results */}
              {result.policy_results.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Policy Violations</h3>
                  {result.policy_results.map((pr: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b last:border-0">
                      <span className="text-xs text-gray-700">{pr.policyName}</span>
                      <span
                        className={`text-xs font-medium ${pr.passed ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {pr.passed ? 'PASS' : pr.action.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400">Latency: {result.latency_ms}ms</p>
            </div>
          )}
          {!result && !guardMutation.isError && (
            <p className="text-sm text-gray-400">Run a guard to see results</p>
          )}
        </div>
      </div>
    </div>
  );
}
