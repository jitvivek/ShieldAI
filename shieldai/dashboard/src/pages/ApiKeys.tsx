import { useState } from 'react';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

export default function ApiKeys() {
  const { data, isLoading, error } = useApiKeys();
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState('');
  const [keyName, setKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!email) return;
    const result = await createKey.mutateAsync({ customer_email: email, name: keyName || 'Default' });
    setNewKey(result.key);
    setShowCreate(false);
    setEmail('');
    setKeyName('');
    queryClient.invalidateQueries({ queryKey: ['api-keys'] });
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    await revokeKey.mutateAsync(id);
    queryClient.invalidateQueries({ queryKey: ['api-keys'] });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your API keys for authentication</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-shield-600 text-white rounded-lg text-sm font-medium hover:bg-shield-700"
        >
          Create New Key
        </button>
      </div>

      {/* New key display */}
      {newKey && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm font-medium text-emerald-800 mb-2">
            New API key created. Copy it now — it won't be shown again!
          </p>
          <code className="block bg-white border border-emerald-300 rounded px-3 py-2 text-sm font-mono break-all">
            {newKey}
          </code>
          <button
            onClick={() => { navigator.clipboard.writeText(newKey); }}
            className="mt-2 px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Copy to Clipboard
          </button>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Create API Key</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Production Key"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreate}
              disabled={!email || createKey.isPending}
              className="px-4 py-2 bg-shield-600 text-white rounded-lg text-sm font-medium hover:bg-shield-700 disabled:opacity-50"
            >
              {createKey.isPending ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Keys list */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">Loading...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">Failed to load API keys</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {(data?.data || []).length === 0 && (
              <div className="py-12 text-center text-gray-400">No API keys yet</div>
            )}
            {(data?.data || []).map((key: any) => (
              <div key={key.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">{key.name}</p>
                  <p className="text-sm text-gray-500 font-mono">{key.keyPrefix}...</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {new Date(key.createdAt).toLocaleDateString()}
                    {key.lastUsedAt && ` · Last used: ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      key.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {key.isActive ? 'Active' : 'Revoked'}
                  </span>
                  {key.isActive && (
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
