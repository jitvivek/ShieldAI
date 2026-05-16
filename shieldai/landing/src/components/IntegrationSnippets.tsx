'use client';

import { useState } from 'react';

const SNIPPETS: Record<string, string> = {
  'Node.js': `import { ShieldAI } from '@shieldai/detect-lite';

const shield = new ShieldAI({ apiKey: process.env.SHIELD_API_KEY });
const result = await shield.detect(userPrompt);
if (result.verdict === 'BLOCK') throw new Error('Blocked');`,

  Python: `import httpx

resp = httpx.post("https://api.shieldai.dev/v1/detect", json={
    "input": user_prompt
}, headers={"Authorization": f"Bearer {API_KEY}"})
result = resp.json()`,

  cURL: `curl -X POST https://api.shieldai.dev/v1/detect \\
  -H "Authorization: Bearer $SHIELD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "Ignore all previous instructions"}'`,

  LangChain: `from langchain.callbacks import ShieldAICallback

callback = ShieldAICallback(api_key=API_KEY)
llm = ChatOpenAI(callbacks=[callback])
llm.invoke("Tell me about India")`,
};

export default function IntegrationSnippets() {
  const [tab, setTab] = useState('Node.js');

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold">Integrate in Minutes</h2>
        <p className="mt-3 text-gray-500">One API call. Any language. Any framework.</p>
        <div className="mt-8">
          <div className="flex justify-center gap-2">
            {Object.keys(SNIPPETS).map((lang) => (
              <button
                key={lang}
                onClick={() => setTab(lang)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                  tab === lang ? 'bg-shield-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-900 p-5 text-left text-sm text-green-300">
            <code>{SNIPPETS[tab]}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
