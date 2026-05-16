# Product Hunt Launch

## Tagline
India's first LLM safety platform — detect prompt injection in Hindi, Hinglish & Tamil

## Description (300 chars)
ShieldAI detects prompt injection, jailbreaks & PII leakage in 12+ languages including Hindi, Hinglish & Tamil. 200+ detection rules, MuRIL ML classifier, entropy analysis — all in <50ms. DPDP Act compliant. Free tier available.

## First Comment (Maker)

Hey Product Hunt! 👋

I built ShieldAI because every LLM security tool I tried failed on Hindi and Hinglish prompts. We have 600M Hindi speakers in India, and when they interact with AI chatbots, they don't switch to English — but attackers know this too.

**What makes ShieldAI different:**

🇮🇳 **Native Indic language support** — Detects injection in Hindi, Hinglish (code-mixed), Tamil, Telugu, Bengali. No other tool does this.

📊 **Multi-layer detection** — Rule engine (200+ patterns) + ML classifier (DeBERTa for English, MuRIL for Indic) + entropy analysis + semantic similarity. All in parallel, <50ms.

🔒 **Indian PII scanning** — Aadhaar, PAN, UPI, IFSC, bank accounts with cryptographic validation (Verhoeff, Luhn).

⚖️ **DPDP Act compliance** — Maps every detection to specific DPDP Act sections. Built-in compliance dashboard.

💰 **India pricing** — From ₹2,900/mo (~$35). Free tier: 1,000 scans/month.

**Try it now:** Paste any prompt at shieldai.dev — no login required.

**Open source:** The `@shieldai/detect-lite` npm package includes all 200+ rules and runs fully offline.

Would love your feedback! What languages should we add next?

## Maker Comment (Reply)

Some technical details for the curious:

- **Architecture:** Express.js API + Python FastAPI ML sidecar + PostgreSQL + Redis
- **Models:** Fine-tuned DeBERTa for English, Google MuRIL for 17 Indic languages, fasttext for language detection
- **Rules:** 12 YAML files covering direct injection, jailbreaks, encoding evasion, roleplay exploits, hypothetical framing, multi-turn, Hindi, Hinglish, Tamil, transliterated attacks
- **Preprocessing:** 5-layer normalization (Unicode, Base64/hex, leetspeak, invisible chars, Indic transliteration)
- **Score fusion:** Weighted ensemble (rules 15%, ML 50%, entropy 15%, semantic 20%) with rule veto at >0.9

We're self-hosted first (Docker Compose), cloud API second. Your data stays on your infrastructure.
