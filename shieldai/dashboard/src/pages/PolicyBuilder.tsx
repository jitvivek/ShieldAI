import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

interface PolicyParameter {
  id: string;
  label: string;
  description: string;
  group: string;
}

interface PolicyParameterGroup {
  id: string;
  label: string;
  description: string;
  parameters: PolicyParameter[];
}

interface BuilderParams {
  groups: PolicyParameterGroup[];
  actions: { id: string; label: string; description: string }[];
  thresholds: { id: string; label: string; description: string; value: number }[];
  industries: { id: string; label: string; description: string }[];
}

interface RuleConfig {
  detector: string;
  action: string;
  severity: string;
  threshold?: number;
  patterns?: string[];
  categories?: string[];
  max_tokens?: number;
  custom_patterns?: string[];
}

type Step = 'industry' | 'parameters' | 'configure' | 'review';

export default function PolicyBuilder() {
  const [step, setStep] = useState<Step>('industry');
  const [policyName, setPolicyName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('general');
  const [selectedParams, setSelectedParams] = useState<Set<string>>(new Set());
  const [rules, setRules] = useState<RuleConfig[]>([]);
  const [generatedYaml, setGeneratedYaml] = useState('');
  const [customPatterns, setCustomPatterns] = useState('');
  const [maxTokens, setMaxTokens] = useState(2000);
  const [threshold, setThreshold] = useState(0.30);

  // Action defaults per group
  const [groupActions, setGroupActions] = useState<Record<string, string>>({
    pii_protection: 'redact',
    content_safety: 'block',
    prompt_security: 'block',
    compliance: 'flag',
    output_controls: 'truncate',
  });
  const [groupSeverities, setGroupSeverities] = useState<Record<string, string>>({
    pii_protection: 'high',
    content_safety: 'critical',
    prompt_security: 'critical',
    compliance: 'high',
    output_controls: 'low',
  });

  const paramsQuery = useQuery({
    queryKey: ['policy-builder-params'],
    queryFn: () => api.getBuilderParameters(),
  });

  const presetQuery = useQuery({
    queryKey: ['policy-preset', selectedIndustry],
    queryFn: () => api.getBuilderPreset(selectedIndustry),
    enabled: false,
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) => api.generatePolicy(data),
    onSuccess: (result: any) => {
      setGeneratedYaml(result.yaml_content);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createBuiltPolicy(data),
    onSuccess: () => {
      setStep('industry');
      setPolicyName('');
      setDescription('');
      setSelectedParams(new Set());
      setRules([]);
      setGeneratedYaml('');
    },
  });

  const params: BuilderParams | undefined = paramsQuery.data;

  // Load preset when industry changes
  useEffect(() => {
    if (selectedIndustry) {
      presetQuery.refetch();
    }
  }, [selectedIndustry]);

  // Auto-select params from preset
  useEffect(() => {
    if (presetQuery.data) {
      const preset = presetQuery.data;
      setPolicyName(preset.name || '');
      setDescription(preset.description || '');

      const paramIds = new Set<string>();
      for (const rule of preset.rules || []) {
        if (rule.patterns) rule.patterns.forEach((p: string) => paramIds.add(p));
        if (rule.categories) rule.categories.forEach((c: string) => paramIds.add(c));
        if (rule.detector === 'prompt_shield') paramIds.add('prompt_leak');
        if (rule.detector === 'jailbreak_detector') paramIds.add('jailbreak');
        if (rule.detector === 'length_check') paramIds.add('response_length');
      }
      setSelectedParams(paramIds);
    }
  }, [presetQuery.data]);

  const toggleParam = (id: string) => {
    setSelectedParams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = (groupId: string) => {
    if (!params) return;
    const group = params.groups.find((g) => g.id === groupId);
    if (!group) return;
    setSelectedParams((prev) => {
      const next = new Set(prev);
      group.parameters.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const deselectAll = (groupId: string) => {
    if (!params) return;
    const group = params.groups.find((g) => g.id === groupId);
    if (!group) return;
    setSelectedParams((prev) => {
      const next = new Set(prev);
      group.parameters.forEach((p) => next.delete(p.id));
      return next;
    });
  };

  const buildRulesFromSelection = () => {
    if (!params) return;
    const newRules: RuleConfig[] = [];

    // PII Protection
    const piiParams = params.groups.find((g) => g.id === 'pii_protection')?.parameters ?? [];
    const selectedPii = piiParams.filter((p) => selectedParams.has(p.id));
    if (selectedPii.length > 0) {
      newRules.push({
        detector: 'pii_detector',
        action: groupActions['pii_protection'] || 'redact',
        severity: groupSeverities['pii_protection'] || 'high',
        patterns: selectedPii.map((p) => p.id),
      });
    }

    // Content Safety
    const contentParams = params.groups.find((g) => g.id === 'content_safety')?.parameters ?? [];
    const selectedContent = contentParams.filter((p) => selectedParams.has(p.id));
    if (selectedContent.length > 0) {
      newRules.push({
        detector: 'content_classifier',
        action: groupActions['content_safety'] || 'block',
        severity: groupSeverities['content_safety'] || 'critical',
        categories: selectedContent.map((p) => p.id),
      });
    }

    // Prompt Security
    if (selectedParams.has('prompt_leak')) {
      newRules.push({
        detector: 'prompt_shield',
        action: groupActions['prompt_security'] || 'block',
        severity: groupSeverities['prompt_security'] || 'critical',
        threshold,
      });
    }
    if (selectedParams.has('jailbreak')) {
      newRules.push({
        detector: 'jailbreak_detector',
        action: groupActions['prompt_security'] || 'block',
        severity: groupSeverities['prompt_security'] || 'critical',
        threshold,
      });
    }

    // Compliance
    const complianceParams = params.groups.find((g) => g.id === 'compliance')?.parameters ?? [];
    const selectedCompliance = complianceParams.filter((p) => selectedParams.has(p.id));
    if (selectedCompliance.length > 0) {
      const complianceCategories = selectedCompliance.map((p) => p.id);
      newRules.push({
        detector: 'keyword_match',
        action: groupActions['compliance'] || 'flag',
        severity: groupSeverities['compliance'] || 'high',
        categories: complianceCategories,
        ...(customPatterns.trim() ? { custom_patterns: customPatterns.split('\n').filter(Boolean) } : {}),
      });
    }

    // Output Controls
    if (selectedParams.has('response_length')) {
      newRules.push({
        detector: 'length_check',
        action: 'truncate',
        severity: groupSeverities['output_controls'] || 'low',
        max_tokens: maxTokens,
      });
    }

    setRules(newRules);
  };

  const handleGenerate = () => {
    buildRulesFromSelection();
    setTimeout(() => {
      const payload = {
        name: policyName || `${selectedIndustry}-custom`,
        description: description || undefined,
        industry: selectedIndustry,
        rules: rules.length > 0 ? rules : undefined,
      };
      generateMutation.mutate(payload);
    }, 100);
  };

  const handleCreate = () => {
    const payload = {
      name: policyName || `${selectedIndustry}-custom`,
      description: description || undefined,
      industry: selectedIndustry,
      rules,
    };
    createMutation.mutate(payload);
  };

  // Generate on step transition to review
  useEffect(() => {
    if (step === 'review') {
      buildRulesFromSelection();
    }
  }, [step]);

  useEffect(() => {
    if (step === 'review' && rules.length > 0) {
      generateMutation.mutate({
        name: policyName || `${selectedIndustry}-custom`,
        description: description || undefined,
        industry: selectedIndustry,
        rules,
      });
    }
  }, [rules]);

  if (paramsQuery.isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-shield-500 border-t-transparent rounded-full" /></div>;
  }

  const stepIndex = { industry: 0, parameters: 1, configure: 2, review: 3 };
  const steps: { key: Step; label: string }[] = [
    { key: 'industry', label: 'Industry' },
    { key: 'parameters', label: 'Parameters' },
    { key: 'configure', label: 'Configure' },
    { key: 'review', label: 'Review & Create' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Policy Builder</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a custom safety policy by selecting parameters — no YAML editing required
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <button
              onClick={() => setStep(s.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === s.key
                  ? 'bg-shield-100 text-shield-700 border border-shield-300'
                  : stepIndex[step] > i
                  ? 'text-green-700 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.key ? 'bg-shield-600 text-white' : stepIndex[step] > i ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepIndex[step] > i ? '✓' : i + 1}
              </span>
              {s.label}
            </button>
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-300 mx-2" />}
          </div>
        ))}
      </div>

      {/* Step 1: Industry */}
      {step === 'industry' && params && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-2">Select your industry</h2>
          <p className="text-sm text-gray-500 mb-4">This pre-selects recommended parameters for your use case. You can customize everything in the next steps.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {params.industries.map((ind) => (
              <button
                key={ind.id}
                onClick={() => setSelectedIndustry(ind.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedIndustry === ind.id
                    ? 'border-shield-500 bg-shield-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <p className="font-medium text-gray-900">{ind.label}</p>
                <p className="text-xs text-gray-500 mt-1">{ind.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Policy Name</label>
              <input
                type="text"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="e.g., my-banking-policy"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Custom policy for our payment chatbot"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={() => setStep('parameters')} className="bg-shield-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-shield-700">
              Next: Select Parameters →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Parameters */}
      {step === 'parameters' && params && (
        <div className="space-y-4">
          {params.groups.map((group) => (
            <div key={group.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-md font-semibold text-gray-900">{group.label}</h3>
                  <p className="text-xs text-gray-500">{group.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => selectAll(group.id)} className="text-xs text-shield-600 hover:text-shield-800">Select All</button>
                  <button onClick={() => deselectAll(group.id)} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {group.parameters.map((param) => (
                  <label
                    key={param.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedParams.has(param.id)
                        ? 'border-shield-400 bg-shield-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedParams.has(param.id)}
                      onChange={() => toggleParam(param.id)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-shield-600 focus:ring-shield-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{param.label}</p>
                      <p className="text-xs text-gray-500">{param.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <button onClick={() => setStep('industry')} className="text-sm text-gray-600 hover:text-gray-900">← Back</button>
            <button
              onClick={() => setStep('configure')}
              disabled={selectedParams.size === 0}
              className="bg-shield-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-shield-700 disabled:opacity-50"
            >
              Next: Configure Actions →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Configure */}
      {step === 'configure' && params && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Configure Actions & Sensitivity</h2>
            <p className="text-sm text-gray-500 mb-6">Choose what happens when each category is detected</p>

            <div className="space-y-6">
              {params.groups.map((group) => {
                const hasSelection = group.parameters.some((p) => selectedParams.has(p.id));
                if (!hasSelection) return null;

                return (
                  <div key={group.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">{group.label}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Action</label>
                        <select
                          value={groupActions[group.id] || 'block'}
                          onChange={(e) => setGroupActions({ ...groupActions, [group.id]: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          {params.actions.map((a) => (
                            <option key={a.id} value={a.id}>{a.label} — {a.description}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
                        <select
                          value={groupSeverities[group.id] || 'high'}
                          onChange={(e) => setGroupSeverities({ ...groupSeverities, [group.id]: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Threshold Config */}
          {(selectedParams.has('prompt_leak') || selectedParams.has('jailbreak')) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Detection Sensitivity</h3>
              <p className="text-xs text-gray-500 mb-3">Lower threshold = more sensitive (may have false positives)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {params.thresholds.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThreshold(t.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      threshold === t.value ? 'border-shield-500 bg-shield-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-gray-500">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Length Config */}
          {selectedParams.has('response_length') && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Response Length Limit</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={500}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">{maxTokens} tokens</span>
              </div>
            </div>
          )}

          {/* Custom Patterns */}
          {params.groups.find((g) => g.id === 'compliance')?.parameters.some((p) => selectedParams.has(p.id)) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Custom Keyword Patterns (optional)</h3>
              <p className="text-xs text-gray-500 mb-2">Add your own keywords to flag or block, one per line</p>
              <textarea
                value={customPatterns}
                onChange={(e) => setCustomPatterns(e.target.value)}
                placeholder={"e.g.:\ninternal memo\nconfidential\ndo not share externally"}
                className="w-full h-32 px-3 py-2 border rounded-lg text-sm font-mono bg-gray-50"
                spellCheck={false}
              />
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep('parameters')} className="text-sm text-gray-600 hover:text-gray-900">← Back</button>
            <button onClick={() => { buildRulesFromSelection(); setStep('review'); }} className="bg-shield-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-shield-700">
              Next: Review & Create →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 'review' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Review Your Policy</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Policy Name</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{policyName || `${selectedIndustry}-custom`}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Industry</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{selectedIndustry}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Parameters Selected</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{selectedParams.size}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Rules Generated</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{rules.length}</p>
              </div>
            </div>

            {/* Rules Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Rules</h3>
              <div className="space-y-2">
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      rule.action === 'block' ? 'bg-red-100 text-red-700' :
                      rule.action === 'flag' ? 'bg-yellow-100 text-yellow-700' :
                      rule.action === 'redact' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{rule.action}</span>
                    <span className="text-sm text-gray-700">{rule.detector.replace(/_/g, ' ')}</span>
                    {rule.patterns && <span className="text-xs text-gray-400">({rule.patterns.length} types)</span>}
                    {rule.categories && <span className="text-xs text-gray-400">({rule.categories.length} categories)</span>}
                    {rule.threshold !== undefined && <span className="text-xs text-gray-400">(threshold: {rule.threshold})</span>}
                    {rule.max_tokens && <span className="text-xs text-gray-400">(max: {rule.max_tokens} tokens)</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Generated YAML Preview */}
            {generatedYaml && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Generated YAML</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto">
                  {generatedYaml}
                </pre>
              </div>
            )}

            {generateMutation.isError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {(generateMutation.error as Error).message}
              </div>
            )}

            {createMutation.isError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {(createMutation.error as Error).message}
              </div>
            )}

            {createMutation.isSuccess && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                Policy created successfully! You can now use it with the /v1/guard endpoint.
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep('configure')} className="text-sm text-gray-600 hover:text-gray-900">← Back</button>
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="border border-shield-600 text-shield-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-shield-50 disabled:opacity-50"
              >
                {generateMutation.isPending ? 'Generating...' : 'Preview YAML'}
              </button>
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || rules.length === 0}
                className="bg-shield-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-shield-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create & Apply Policy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
