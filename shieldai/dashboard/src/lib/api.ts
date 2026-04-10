const API_BASE = '/v1';

function getApiKey(): string {
  return localStorage.getItem('shieldai_api_key') || '';
}

export function setApiKey(key: string): void {
  localStorage.setItem('shieldai_api_key', key);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const apiKey = getApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  detect: (input: string) =>
    apiFetch<any>('/detect', {
      method: 'POST',
      body: JSON.stringify({ input, config: { include_breakdown: true } }),
    }),

  getHealth: () => apiFetch<any>('/health'),

  getStats: () => apiFetch<any>('/stats'),

  getLogs: (params: { page?: number; per_page?: number; verdict?: string }) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.per_page) query.set('per_page', params.per_page.toString());
    if (params.verdict) query.set('verdict', params.verdict);
    return apiFetch<any>(`/logs?${query.toString()}`);
  },

  getApiKeys: () => apiFetch<any>('/api-keys'),

  createApiKey: (data: { name?: string; customer_email: string; tier?: string }) =>
    apiFetch<any>('/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  revokeApiKey: (id: string) =>
    apiFetch<any>(`/api-keys/${id}`, { method: 'DELETE' }),

  // PHASE 2 ADDITION
  guard: (data: { input: string; output?: string; policy?: string; system_prompt?: string; canary_tokens?: string[] }) =>
    apiFetch<any>('/guard', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  scanOutput: (data: { output: string; policy?: string; system_prompt?: string; canary_tokens?: string[] }) =>
    apiFetch<any>('/scan/output', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPolicies: () => apiFetch<any>('/policies'),

  getPolicy: (name: string) => apiFetch<any>(`/policies/${name}`),

  createPolicy: (data: { name: string; yaml_content: string }) =>
    apiFetch<any>('/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePolicy: (name: string, yaml_content: string) =>
    apiFetch<any>(`/policies/${name}`, {
      method: 'PUT',
      body: JSON.stringify({ yaml_content }),
    }),

  deletePolicy: (name: string) =>
    apiFetch<any>(`/policies/${name}`, { method: 'DELETE' }),
};
