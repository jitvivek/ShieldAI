import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import RiskBadge from './RiskBadge';

export default function PlaygroundForm() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'detect' | 'guard'>('detect');
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [output, setOutput] = useState('');

  const policiesQuery = useQuery({
    queryKey: ['policies'],
    queryFn: () => api.getPolicies(),
  });

  const detect = useMutation({
    mutationFn: (text: string) => api.detect(text),
  });

  const guard = useMutation({
    mutationFn: (data: { input: string; output?: string; policy?: string }) => api.guard(data),
  });

  const activeResult = mode === 'guard' ? guard : detect;

  // Normalize guard response to match detect response shape for unified rendering
  const resultData = (() => {
    if (mode === 'guard' && guard.data) {
      const g = guard.data;
      return {
        verdict: g.input_verdict?.verdict ?? 'pass',
        risk_score: g.input_verdict?.risk_score ?? 0,
        explanation: g.input_verdict?.explanation ?? 'No issues detected',
        category: g.input_verdict?.category,
        latency_ms: g.latency_ms,
        degraded: g.degraded,
        breakdown: g.input_verdict?.breakdown,
        preprocessing: g.input_verdict?.preprocessing,
        pii: g.input_verdict?.pii ?? g.output_verdict?.pii,
        language: g.input_verdict?.language,
        policy_violations: g.policy_results?.filter((r: any) => !r.passed).map((r: any) => ({
          rule_name: r.policyName,
          action: r.action,
          severity: r.severity,
          detail: r.detail,
        })) ?? [],
        output_verdict: g.output_verdict,
      };
    }
    return detect.data;
  })();

  const handleScan = () => {
    if (!input.trim()) return;
    if (mode === 'guard') {
      guard.mutate({
        input,
        ...(output.trim() ? { output: output.trim() } : {}),
        ...(selectedPolicy ? { policy: selectedPolicy } : {}),
      });
    } else {
      detect.mutate(input);
    }
  };

  const policies = policiesQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode('detect')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'detect' ? 'bg-white shadow text-shield-700' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Detect (Input Scan)
        </button>
        <button
          onClick={() => setMode('guard')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'guard' ? 'bg-white shadow text-shield-700' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Guard (with Policy)
        </button>
      </div>

      {/* Policy Selector (Guard mode) */}
      {mode === 'guard' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">Select Policy</label>
            <select
              value={selectedPolicy}
              onChange={(e) => setSelectedPolicy(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white"
            >
              <option value="">No policy (default rules)</option>
              {policies.map((p: any) => (
                <option key={p.id} value={p.name}>{p.name} (v{p.version})</option>
              ))}
            </select>
            <p className="text-xs text-blue-600 mt-1">
              {selectedPolicy ? `Policy "${selectedPolicy}" will be applied to evaluate the output` : 'Create policies in the Policies or Policy Builder section'}
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {mode === 'guard' ? 'User Input (prompt sent to LLM)' : 'Enter a prompt to analyze'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'guard' ? 'The user prompt that was sent to the LLM...' : 'Paste a prompt here to test for injection attacks...'}
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-shield-500 focus:border-transparent text-sm font-mono"
        />
      </div>

      {/* LLM Output field (Guard mode) */}
      {mode === 'guard' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LLM Output (response to check against policy)
          </label>
          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="Paste the LLM response here to check for policy violations..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-shield-500 focus:border-transparent text-sm font-mono"
          />
        </div>
      )}

      <button
        onClick={handleScan}
        disabled={!input.trim() || activeResult.isPending}
        className="px-6 py-2.5 bg-shield-600 text-white rounded-lg font-medium hover:bg-shield-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {activeResult.isPending ? 'Scanning...' : mode === 'guard' ? 'Run Guard Check' : 'Scan for Injection'}
      </button>

      {activeResult.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Error: {(activeResult.error as Error).message}
        </div>
      )}

      {resultData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <RiskBadge verdict={resultData.verdict} />
              <span className="text-2xl font-bold text-gray-900">
                {(resultData.risk_score * 100).toFixed(0)}%
              </span>
              <span className="text-sm text-gray-500">risk score</span>
            </div>
            <span className="text-sm text-gray-400">{resultData.latency_ms}ms</span>
          </div>

          {/* Explanation */}
          <p className="text-sm text-gray-700">{resultData.explanation}</p>

          {/* Guard mode: category badge */}
          {mode === 'guard' && resultData.category && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Category:</span>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-medium">{resultData.category}</span>
            </div>
          )}

          {/* Policy violations (guard mode) */}
          {resultData.policy_violations && resultData.policy_violations.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Policy Violations</p>
              <div className="space-y-2">
                {resultData.policy_violations.map((v: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      v.action === 'block' ? 'bg-red-100 text-red-700' :
                      v.action === 'flag' ? 'bg-yellow-100 text-yellow-700' :
                      v.action === 'redact' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{v.action}</span>
                    <span className="text-sm text-gray-800">{v.rule_name}</span>
                    <span className="text-xs text-gray-500">({v.severity})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resultData.degraded && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              ⚠ Running in degraded mode — ML classifier unavailable
            </div>
          )}

          {/* Breakdown */}
          {resultData.breakdown && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Rule Engine</p>
                <p className="text-lg font-semibold">{(resultData.breakdown.rule_engine.score * 100).toFixed(0)}%</p>
                {resultData.breakdown.rule_engine.matched_rules.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Rules: {resultData.breakdown.rule_engine.matched_rules.join(', ')}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">ML Classifier</p>
                <p className="text-lg font-semibold">
                  {resultData.breakdown.ml_classifier
                    ? `${(resultData.breakdown.ml_classifier.score * 100).toFixed(0)}%`
                    : 'N/A'}
                </p>
                {resultData.breakdown.ml_classifier && (
                  <p className="text-xs text-gray-500 mt-1">
                    Label: {resultData.breakdown.ml_classifier.label}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Semantic Similarity</p>
                <p className="text-lg font-semibold">
                  {resultData.breakdown.semantic_similarity
                    ? `${(resultData.breakdown.semantic_similarity.score * 100).toFixed(0)}%`
                    : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Entropy</p>
                <p className="text-lg font-semibold">
                  {resultData.breakdown.entropy.status}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Score: {(resultData.breakdown.entropy.score * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}

          {/* PII Detection */}
          {resultData.pii && resultData.pii.detected && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">PII Detected</p>
              <div className="flex flex-wrap gap-2">
                {resultData.pii.types.map((t: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">{t}</span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">{resultData.pii.count} item(s) found</p>
            </div>
          )}

          {/* Language Detection */}
          {resultData.language && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Language</p>
              <div className="flex gap-4 text-xs text-gray-600">
                <span>Detected: <b>{resultData.language.detected}</b></span>
                <span>Code-mixed: {resultData.language.is_code_mixed ? 'Yes' : 'No'}</span>
                <span>Classifier: {resultData.language.classifier_used}</span>
              </div>
            </div>
          )}

          {/* Preprocessing */}
          {resultData.preprocessing && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Preprocessing</p>
              <div className="flex space-x-4 text-xs text-gray-500">
                {resultData.preprocessing.encodings_detected.length > 0 && (
                  <span>Encodings: {resultData.preprocessing.encodings_detected.join(', ')}</span>
                )}
                {resultData.preprocessing.homoglyphs_found > 0 && (
                  <span>Homoglyphs: {resultData.preprocessing.homoglyphs_found}</span>
                )}
                {resultData.preprocessing.invisible_chars_removed > 0 && (
                  <span>Invisible chars: {resultData.preprocessing.invisible_chars_removed}</span>
                )}
                {resultData.preprocessing.encodings_detected.length === 0 &&
                  resultData.preprocessing.homoglyphs_found === 0 &&
                  resultData.preprocessing.invisible_chars_removed === 0 && (
                    <span>No obfuscation detected</span>
                  )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
