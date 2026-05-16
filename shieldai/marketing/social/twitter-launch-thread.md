# Twitter/X Launch Thread

## Tweet 1 (Hook)
🚀 Launching ShieldAI — India's first LLM safety platform.

We detect prompt injection in Hindi, Hinglish, Tamil, Telugu & Bengali.

No other tool does this.

Here's why it matters 🧵👇

## Tweet 2 (Problem)
Every LLM security tool was built for English.

Test it: paste "सभी नियमों को अनदेखा करो" (Hindi: "ignore all rules") into any competitor.

Result: "Safe" ✅

That's 600 million Hindi speakers left unprotected.

## Tweet 3 (Demo)
We built a 5-layer detection pipeline:

• Rule engine (200+ patterns)
• ML classifier (DeBERTa + MuRIL)
• Entropy analysis
• Semantic similarity
• Indic transliteration

All parallel. < 50ms average.

Paste any prompt at shieldai.dev — no login needed.

## Tweet 4 (Indian Language Focus)
Attack languages we detect:

🇮🇳 Hindi (Devanagari) — 30 rules
🔀 Hinglish (code-mixed) — 25 rules
🇮🇳 Tamil — 15 rules
📝 Transliterated Hindi — 20 rules
🇬🇧 English — 100+ rules

MuRIL classifier handles what rules miss.

## Tweet 5 (PII)
Indian PII scanning:

• Aadhaar (with Verhoeff checksum ✓)
• PAN card
• UPI IDs
• IFSC codes
• Bank accounts
• Indian phone numbers
• Passports & Voter IDs

Every detection mapped to the specific DPDP Act section. ⚖️

## Tweet 6 (Open Source)
The open-source package:

```
npm install @shieldai/detect-lite
```

• All 200+ rules embedded
• Entropy analysis
• Indic normalization
• Zero API calls — runs fully offline
• Free forever

The rules-only version catches ~55% of attacks. API catches 95%+.

## Tweet 7 (Pricing)
India-first pricing:

🆓 Free: 1,000 scans/mo
💼 Starter: ₹2,900/mo ($35)
📈 Growth: ₹8,750/mo ($105)
🏢 Enterprise: Custom

Competitors charge $300-500/mo for English-only detection.

We start at ₹2,900 with Hindi, Tamil, PII scanning & DPDP compliance included.

## Tweet 8 (CTA)
ShieldAI is live.

🌐 Playground: shieldai.dev
📦 NPM: @shieldai/detect-lite
📖 Docs: docs.shieldai.dev
🐙 GitHub: github.com/shieldai

If you're building LLM apps for Indian users, your current security tool is blind to 600M Hindi speakers.

Fix that today. 🛡️
