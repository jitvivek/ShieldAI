import type { ScanResponse } from '../shared/types';
import { API_URL, API_DETECT_ENDPOINT } from '../shared/constants';

interface ApiDetectResponse {
  verdict: 'pass' | 'flag' | 'block';
  riskScore: number;
  category: string;
  language: string;
  signals: {
    rules?: { score: number; matches: Array<{ id: string; name: string; category: string }> };
    ml?: { score: number; label: string };
    entropy?: { score: number };
    semantic?: { score: number };
  };
}

export async function callShieldApi(text: string, apiKey: string, apiUrl?: string): Promise<ScanResponse | null> {
  const baseUrl = apiUrl || API_URL;
  const url = `${baseUrl}${API_DETECT_ENDPOINT}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: text }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return null; // Trigger offline fallback
    }

    const data: ApiDetectResponse = await response.json();

    const verdictMap: Record<string, ScanResponse['verdict']> = {
      pass: 'safe',
      flag: 'suspicious',
      block: 'malicious',
    };

    return {
      verdict: verdictMap[data.verdict] || 'safe',
      riskScore: data.riskScore,
      category: data.category || 'none',
      language: data.language || 'English',
      piiDetected: [],
      details: data.signals.rules?.matches?.map(m => m.name).join(', ') || '',
      offline: false,
    };
  } catch {
    return null; // Network failure → offline fallback
  }
}
