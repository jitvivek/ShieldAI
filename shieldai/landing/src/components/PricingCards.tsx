'use client';

import { useState } from 'react';

const TIERS = [
  {
    name: 'Free',
    priceINR: 0,
    priceUSD: 0,
    period: '/mo',
    features: ['1,000 scans/mo', 'Rule engine only', 'Community support', '1 API key'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Starter',
    priceINR: 2900,
    priceUSD: 35,
    period: '/mo',
    features: ['25,000 scans/mo', 'Rules + ML classifier', 'Email support', '5 API keys', 'Dashboard'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Growth',
    priceINR: 8750,
    priceUSD: 105,
    period: '/mo',
    features: [
      '250,000 scans/mo',
      'Full pipeline (all 4 engines)',
      'Indic languages',
      'PII detection',
      'Priority support',
      'Custom rules',
    ],
    cta: 'Start Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    priceINR: -1,
    priceUSD: -1,
    period: '',
    features: [
      'Unlimited scans',
      'On-premise deployment',
      'DPDP compliance suite',
      'Dedicated support',
      'SLA 99.9%',
      'Custom models',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

function formatPrice(amount: number, currency: 'INR' | 'USD') {
  if (amount < 0) return 'Custom';
  if (amount === 0) return currency === 'INR' ? '₹0' : '$0';
  return currency === 'INR' ? `₹${amount.toLocaleString('en-IN')}` : `$${amount}`;
}

export default function PricingCards() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrency('INR')}
            className={`rounded px-3 py-1 text-sm font-medium ${currency === 'INR' ? 'bg-shield-600 text-white' : 'bg-gray-200'}`}
          >
            🇮🇳 INR
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`rounded px-3 py-1 text-sm font-medium ${currency === 'USD' ? 'bg-shield-600 text-white' : 'bg-gray-200'}`}
          >
            🇺🇸 USD
          </button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-6 text-left ${tier.highlight ? 'border-shield-500 ring-2 ring-shield-500/20 shadow-lg' : ''}`}
            >
              <div className="text-sm font-semibold text-shield-600">{tier.name}</div>
              <div className="mt-2 text-3xl font-bold">
                {formatPrice(currency === 'INR' ? tier.priceINR : tier.priceUSD, currency)}
                <span className="text-base font-normal text-gray-400">{tier.period}</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-gray-600">
                {tier.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full rounded-lg py-2.5 text-sm font-semibold transition ${
                  tier.highlight
                    ? 'bg-shield-600 text-white hover:bg-shield-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
