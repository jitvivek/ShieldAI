const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.shieldai.dev';

export async function scanPrompt(input: string): Promise<{
  verdict: string;
  riskScore: number;
  detectedLanguage: string;
  matchedRules: string[];
  latencyMs: number;
}> {
  const res = await fetch(`${API_BASE}/v1/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
