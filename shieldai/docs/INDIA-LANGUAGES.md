# Indic Language Support

ShieldAI provides native detection for prompt injection attacks in Indian languages.

## Supported Languages

| Language | Script | Code | Rules | ML Model |
|----------|--------|------|-------|----------|
| Hindi | Devanagari | `hi` | 30 patterns | MuRIL |
| Hinglish | Latin + Devanagari | `hi-en` | 25 patterns | MuRIL + DeBERTa ensemble |
| Tamil | Tamil | `ta` | 15 patterns | MuRIL |
| Telugu | Telugu | `te` | — | MuRIL |
| Bengali | Bengali | `bn` | — | MuRIL |
| Transliterated | Latin | `hi-latn` | 20 patterns | MuRIL |

## Detection Pipeline

1. **Language Detection** — fasttext `lid.176.bin` + script heuristic fallback
2. **Indic Normalization** — transliteration, code-mixing detection, keyword extraction
3. **Rule Engine** — Language-specific YAML rule files (`hindi-injection.yaml`, etc.)
4. **ML Classifier** — MuRIL zero-shot NLI for Indic, DeBERTa for English, ensemble for code-mixed
5. **Score Fusion** — Same weights applied regardless of language

## Rule Files

- `rules/hindi-injection.yaml` — 30 Devanagari patterns (HI001–HI030)
- `rules/hinglish-injection.yaml` — 25 code-mixed patterns (HE001–HE025)
- `rules/tamil-injection.yaml` — 15 Tamil script patterns (TA001–TA015)
- `rules/transliterated-injection.yaml` — 20 romanized Indic patterns (TR001–TR020)

## PII Detection (Indian)

Supported PII types with validation:

| Type | Validation | Example |
|------|-----------|---------|
| Aadhaar | Verhoeff checksum | `2234 5678 9012` |
| PAN | Format `AAAAA9999A` | `ABCDE1234F` |
| UPI ID | `name@provider` format | `user@upi` |
| IFSC | 11-char bank code | `SBIN0001234` |
| Indian Phone | `+91` / `0` prefix, 10 digits | `+91 98765 43210` |
| Indian Passport | `A-Z` + 7 digits | `J1234567` |
| Voter ID (EPIC) | 3 letters + 7 digits | `ABC1234567` |
| Bank Account | 9-18 digits with context | `A/C: 12345678901234` |

## DPDP Act Compliance

All PII detections include applicable DPDP Act section references:
- **Section 4** — Processing of personal data
- **Section 5** — Notice requirements
- **Section 6** — Consent
- **Section 8** — Data principal rights
- **Section 9** — Special provisions for children's data

## API Response

When Indic content is detected, the API response includes additional fields:

```json
{
  "detectedLanguage": "hi",
  "isCodeMixed": false,
  "classifierUsed": "muril",
  "piiDetected": ["aadhaar", "pan"]
}
```
