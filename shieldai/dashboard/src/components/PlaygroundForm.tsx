import { useState } from 'react';
import { useDetect } from '../hooks/useApi';
import RiskBadge from './RiskBadge';

export default function PlaygroundForm() {
  const [input, setInput] = useState('');
  const detect = useDetect();

  const handleScan = () => {
    if (!input.trim()) return;
    detect.mutate(input);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter a prompt to analyze
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a prompt here to test for injection attacks..."
          className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-shield-500 focus:border-transparent text-sm font-mono"
        />
      </div>

      <button
        onClick={handleScan}
        disabled={!input.trim() || detect.isPending}
        className="px-6 py-2.5 bg-shield-600 text-white rounded-lg font-medium hover:bg-shield-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {detect.isPending ? 'Scanning...' : 'Scan for Injection'}
      </button>

      {detect.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Error: {detect.error.message}
        </div>
      )}

      {detect.data && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <RiskBadge verdict={detect.data.verdict} />
              <span className="text-2xl font-bold text-gray-900">
                {(detect.data.risk_score * 100).toFixed(0)}%
              </span>
              <span className="text-sm text-gray-500">risk score</span>
            </div>
            <span className="text-sm text-gray-400">{detect.data.latency_ms}ms</span>
          </div>

          {/* Explanation */}
          <p className="text-sm text-gray-700">{detect.data.explanation}</p>

          {detect.data.degraded && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              ⚠ Running in degraded mode — ML classifier unavailable
            </div>
          )}

          {/* Breakdown */}
          {detect.data.breakdown && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Rule Engine</p>
                <p className="text-lg font-semibold">{(detect.data.breakdown.rule_engine.score * 100).toFixed(0)}%</p>
                {detect.data.breakdown.rule_engine.matched_rules.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Rules: {detect.data.breakdown.rule_engine.matched_rules.join(', ')}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">ML Classifier</p>
                <p className="text-lg font-semibold">
                  {detect.data.breakdown.ml_classifier
                    ? `${(detect.data.breakdown.ml_classifier.score * 100).toFixed(0)}%`
                    : 'N/A'}
                </p>
                {detect.data.breakdown.ml_classifier && (
                  <p className="text-xs text-gray-500 mt-1">
                    Label: {detect.data.breakdown.ml_classifier.label}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Semantic Similarity</p>
                <p className="text-lg font-semibold">
                  {detect.data.breakdown.semantic_similarity
                    ? `${(detect.data.breakdown.semantic_similarity.score * 100).toFixed(0)}%`
                    : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Entropy</p>
                <p className="text-lg font-semibold">
                  {detect.data.breakdown.entropy.status}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Score: {(detect.data.breakdown.entropy.score * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}

          {/* Preprocessing */}
          {detect.data.preprocessing && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Preprocessing</p>
              <div className="flex space-x-4 text-xs text-gray-500">
                {detect.data.preprocessing.encodings_detected.length > 0 && (
                  <span>Encodings: {detect.data.preprocessing.encodings_detected.join(', ')}</span>
                )}
                {detect.data.preprocessing.homoglyphs_found > 0 && (
                  <span>Homoglyphs: {detect.data.preprocessing.homoglyphs_found}</span>
                )}
                {detect.data.preprocessing.invisible_chars_removed > 0 && (
                  <span>Invisible chars: {detect.data.preprocessing.invisible_chars_removed}</span>
                )}
                {detect.data.preprocessing.encodings_detected.length === 0 &&
                  detect.data.preprocessing.homoglyphs_found === 0 &&
                  detect.data.preprocessing.invisible_chars_removed === 0 && (
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
