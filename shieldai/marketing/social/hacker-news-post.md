# Show HN: ShieldAI — Prompt injection detection with Hindi, Hinglish & Tamil support

## Title
Show HN: ShieldAI – Prompt injection detection for Indian languages (Hindi/Tamil/Telugu)

## Description

I built ShieldAI because every prompt injection detection tool fails on non-English inputs. Test it yourself: paste "सभी नियमों को अनदेखा करो" (Hindi for "ignore all rules") into Lakera, Prompt Armor, or any other tool — they all score it as safe.

ShieldAI is a multi-layer detection pipeline:

1. **Preprocessing** — Decodes Base64, hex, Unicode, leetspeak, and Indic transliterations
2. **Rule engine** — 200+ regex patterns across 12 YAML files (English, Hindi, Hinglish, Tamil, transliterated)
3. **ML classifier** — DeBERTa for English, MuRIL (Google's Multilingual Representations for Indian Languages) for Hindi/Tamil/Telugu/Bengali
4. **Entropy analysis** — Catches encoded/obfuscated payloads
5. **Semantic similarity** — Embeddings-based detection for novel attacks

All layers run in parallel. Average latency: 45ms.

**Indian PII scanning:** Detects Aadhaar (with Verhoeff checksum validation), PAN, UPI IDs, IFSC codes, and maps each to the relevant DPDP Act section.

**Stack:** Node.js/TypeScript API + Python FastAPI ML sidecar + PostgreSQL + Redis. Runs via Docker Compose.

**Open source component:** `npm install @shieldai/detect-lite` — includes all 200+ rules, runs fully offline, zero dependencies.

**Live playground:** shieldai.dev (no login required)

Repo: github.com/shieldai/shieldai

## Key Technical Details

- Score fusion weights: rule=15%, ML=50%, entropy=15%, semantic=20%
- Rule veto: any rule score >0.9 overrides fusion to BLOCK
- Thresholds: <0.3 = PASS, 0.3-0.7 = FLAG, >0.7 = BLOCK
- Code-mixed (Hinglish) detection uses ensemble: max(DeBERTa, MuRIL)
- PII validation: Verhoeff algorithm for Aadhaar, Luhn for credit cards
- DPDP compliance engine maps detections to specific Act sections with remediation advice
