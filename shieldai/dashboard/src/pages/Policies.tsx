import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function Policies() {
  const [newName, setNewName] = useState('');
  const [newYaml, setNewYaml] = useState(DEFAULT_POLICY_YAML);
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editYaml, setEditYaml] = useState('');

  const policiesQuery = useQuery({
    queryKey: ['policies'],
    queryFn: () => api.getPolicies(),
  });

  const policyDetailQuery = useQuery({
    queryKey: ['policy-detail', selectedPolicy],
    queryFn: () => api.getPolicy(selectedPolicy!),
    enabled: !!selectedPolicy,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; yaml_content: string }) => api.createPolicy(data),
    onSuccess: () => {
      policiesQuery.refetch();
      setNewName('');
      setNewYaml(DEFAULT_POLICY_YAML);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ name, yaml_content }: { name: string; yaml_content: string }) => api.updatePolicy(name, yaml_content),
    onSuccess: () => {
      policiesQuery.refetch();
      policyDetailQuery.refetch();
      setEditMode(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => api.deletePolicy(name),
    onSuccess: (_data, name) => {
      policiesQuery.refetch();
      if (selectedPolicy === name) setSelectedPolicy(null);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name: newName, yaml_content: newYaml });
  };

  const policies = policiesQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure YAML policies for output scanning and guardrails
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Your Policies</h2>
          {policies.length === 0 ? (
            <p className="text-sm text-gray-400">No policies yet. Create one below.</p>
          ) : (
            <div className="space-y-2">
              {policies.map((p: any) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                    selectedPolicy === p.name ? 'border-shield-500 bg-shield-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPolicy(p.name)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">v{p.version}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(p.name);
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Template selector */}
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick templates</h3>
            <div className="flex flex-wrap gap-2">
              {['default', 'strict', 'permissive', 'bfsi'].map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => {
                    setNewName(tmpl);
                    setNewYaml(TEMPLATES[tmpl] ?? DEFAULT_POLICY_YAML);
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* YAML Editor / Policy Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          {/* Policy Detail View */}
          {selectedPolicy && policyDetailQuery.data ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{policyDetailQuery.data.name}</h2>
                  <p className="text-xs text-gray-500">Version {policyDetailQuery.data.version} · Created {new Date(policyDetailQuery.data.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  {!editMode && (
                    <button
                      onClick={() => { setEditYaml(policyDetailQuery.data.yaml_content); setEditMode(true); }}
                      className="px-3 py-1.5 text-xs border border-shield-500 text-shield-600 rounded-lg hover:bg-shield-50"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedPolicy(null); setEditMode(false); }}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Usage instruction */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-800 mb-1">How to use this policy:</p>
                <p className="text-xs text-blue-700">Go to <b>Playground</b> tab, select this policy from the dropdown, and test prompts. The guard will evaluate outputs against these rules.</p>
                <code className="block mt-2 text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded font-mono">
                  POST /v1/guard {`{ "input": "...", "policy": "${selectedPolicy}" }`}
                </code>
              </div>

              {editMode ? (
                <div className="space-y-3">
                  <textarea
                    value={editYaml}
                    onChange={(e) => setEditYaml(e.target.value)}
                    className="w-full h-72 px-3 py-2 border rounded-lg text-sm font-mono bg-gray-50"
                    spellCheck={false}
                  />
                  {updateMutation.isError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      {(updateMutation.error as Error).message}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateMutation.mutate({ name: selectedPolicy, yaml_content: editYaml })}
                      disabled={updateMutation.isPending}
                      className="bg-shield-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-shield-700 disabled:opacity-50"
                    >
                      {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={() => setEditMode(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {policyDetailQuery.data.yaml_content}
                </pre>
              )}
            </div>
          ) : (
            /* Create New Policy Form */
            <div>
              <h2 className="text-lg font-semibold mb-4">Create Policy</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., my-strict-policy"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YAML Configuration</label>
                  <textarea
                    value={newYaml}
                    onChange={(e) => setNewYaml(e.target.value)}
                    className="w-full h-80 px-3 py-2 border rounded-lg text-sm font-mono bg-gray-50"
                    spellCheck={false}
                    required
                  />
                </div>
                {createMutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {(createMutation.error as Error).message}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-shield-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-shield-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Policy'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DEFAULT_POLICY_YAML = `name: my-policy
version: 1
policies:
  - name: no_pii_in_output
    action: redact
    severity: high
    detector: pii_detector
    patterns: [email, phone_india, aadhaar, pan, credit_card]

  - name: no_system_prompt_leak
    action: block
    severity: critical
    detector: prompt_shield

  - name: response_length_limit
    action: truncate
    severity: low
    detector: length_check
    max_tokens: 2000
`;

const TEMPLATES: Record<string, string> = {
  default: DEFAULT_POLICY_YAML,
  strict: `name: strict
version: 1
policies:
  - name: no_pii_in_output
    action: block
    severity: critical
    detector: pii_detector
    patterns: [email, phone_india, phone_intl, aadhaar, pan, credit_card, ip_address]

  - name: no_system_prompt_leak
    action: block
    severity: critical
    detector: prompt_shield
    threshold: 0.2

  - name: no_harmful_content
    action: block
    severity: critical
    detector: content_classifier
    categories: [weapons, drugs, self_harm, violence]

  - name: response_length_limit
    action: truncate
    severity: medium
    detector: length_check
    max_tokens: 1000
`,
  permissive: `name: permissive
version: 1
policies:
  - name: pii_logging
    action: flag
    severity: low
    detector: pii_detector
    patterns: [email, credit_card]

  - name: prompt_leak_logging
    action: flag
    severity: medium
    detector: prompt_shield
`,
  bfsi: `name: bfsi
version: 1
policies:
  - name: no_pii_leakage
    action: block
    severity: critical
    detector: pii_detector
    patterns: [email, phone_india, aadhaar, pan, credit_card]

  - name: no_system_prompt_leak
    action: block
    severity: critical
    detector: prompt_shield
    threshold: 0.15

  - name: no_financial_advice
    action: flag
    severity: high
    detector: keyword_match
    patterns: [guaranteed returns, risk free, invest now, double your money]

  - name: rbi_compliance
    action: block
    severity: critical
    detector: keyword_match
    patterns: [internal rate, customer account number, transaction id]

  - name: response_limit
    action: truncate
    severity: medium
    detector: length_check
    max_tokens: 1500
`,
};
