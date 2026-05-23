import { CONFIG } from '@/constants/config';

interface DetectResult {
  verdict: 'safe' | 'suspicious' | 'malicious';
  score: number;
  category: string;
  explanation: string;
  language: string;
  source: 'api';
}

class ScanService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = CONFIG.SHIELDAI_API_URL;
    this.apiKey = CONFIG.SHIELDAI_API_KEY;
  }

  async detect(text: string): Promise<DetectResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${this.apiUrl}/v1/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({ input: text, context: 'child_monitoring' }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        verdict: data.verdict ?? 'safe',
        score: data.risk_score ?? 0,
        category: data.category ?? '',
        explanation: data.explanation ?? '',
        language: data.language ?? 'en',
        source: 'api',
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const scanService = new ScanService();
