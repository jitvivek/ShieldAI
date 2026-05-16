import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShieldAI — India\'s First LLM Safety Platform',
  description:
    'Real-time prompt injection detection, jailbreak prevention, and PII scanning with native Hindi, Hinglish & Tamil support. DPDP Act compliant.',
  openGraph: {
    title: 'ShieldAI — India\'s First LLM Safety Platform',
    description: 'Real-time prompt injection detection with native Indic language support.',
    type: 'website',
    url: 'https://shieldai.dev',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
