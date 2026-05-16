# Day 10 — Feature Teaser Email

**Subject:** Coming soon: Output scanning + DPDP compliance dashboard

---

Hi {{first_name}},

We're shipping two features this month that Indian developers have been asking for:

## 1. Output Scanning (Phase 2)

Currently, ShieldAI scans **inputs** to the LLM. Soon, you'll be able to scan **outputs** too — catching cases where the LLM generates responses containing:

- Aadhaar numbers from RAG context
- PAN cards from training data memorization
- UPI IDs, bank account numbers, IFSC codes
- Harmful content that bypassed input filters

This is critical for DPDP Act Section 8(1) compliance — you need to protect personal data in both directions.

## 2. DPDP Compliance Dashboard

A real-time compliance view showing:
- 🟢🟡🔴 Traffic light status per regulation (DPDP, IT Act, RBI, SEBI)
- Violation trend charts (last 30 days)
- Automatic remediation recommendations
- One-click compliance report generation
- Data retention status and auto-purge scheduling

If you're in fintech, banking, or insurance, the dashboard automatically activates RBI and SEBI compliance tracking based on your industry setting.

## What You Can Do Today

While you wait for these features, here's what's available now:

- ✅ Full input scanning (English + 5 Indian languages)
- ✅ Indian PII detection (Aadhaar, PAN, UPI, IFSC)
- ✅ 200+ detection rules
- ✅ ML classification (DeBERTa + MuRIL)
- ✅ Basic compliance status via API: `GET /v1/compliance/status`

## Your Account

- Plan: **{{plan_name}}**
- Scans this month: **{{scans_used}}/{{scan_limit}}**
- Top detected language: **{{top_language}}**

Want early access to output scanning? Reply with "early access" and we'll add you to the beta.

— The ShieldAI Team

---
*[Unsubscribe]({{unsubscribe_url}})*
