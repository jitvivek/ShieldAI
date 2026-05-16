# DPDP Act Compliance for LLM Applications: What Developers Need to Know

*Published: May 15, 2026 · 7 min read*

## Introduction

India's Digital Personal Data Protection Act (DPDP, 2023) is now fully in effect, and every company deploying LLM-powered applications in India must comply. The penalties are severe — up to **₹250 crore per violation** — and the Act's broad definition of "personal data" means almost every LLM interaction is in scope.

This guide covers the specific DPDP Act sections relevant to LLM deployments, what constitutes a violation, and how to build a compliant AI application.

## Which DPDP Sections Apply to LLMs?

### Section 4: Lawful Purpose and Consent

**What it says:** Personal data can only be processed for a lawful purpose with the consent of the data principal.

**LLM implication:** If your LLM processes, stores, or analyzes any personal data (names, phone numbers, Aadhaar, PAN, addresses) from user inputs or retrieved documents, you must have explicit consent.

**Common violation:** A customer support chatbot stores conversation logs containing customer PAN numbers without explicit consent for data storage.

**Mitigation:**
- Scan all LLM inputs for PII before processing
- If PII is detected, redact it from logs or obtain consent before storing
- ShieldAI's PII scanner detects and flags Section 4 violations automatically

### Section 5: Notice

**What it says:** Before collecting personal data, the data fiduciary must provide notice to the data principal specifying what data is being collected and why.

**LLM implication:** If your LLM collects or processes personal data during conversations, users must be informed upfront. This includes RAG systems that pull personal data from databases.

**Common violation:** An LLM-powered HR chatbot retrieves employee personal data from an HR database without notifying the employee that their data is being processed by an AI system.

### Section 6: Consent

**What it says:** Consent must be free, specific, informed, unconditional, and unambiguous.

**LLM implication:** A generic "I agree to terms" checkbox is not sufficient. Users must specifically consent to their data being processed by an AI system, stored in conversation logs, and used for model improvement (if applicable).

### Section 8: Obligations of Data Fiduciary

**What it says:** Data fiduciaries must implement reasonable security safeguards to protect personal data.

**LLM implication:** This is the most directly relevant section. Sub-section 8(1) requires:
- Encryption of personal data at rest and in transit
- Access controls on who can view conversation logs
- **Prompt injection protection** — if an attacker extracts personal data via injection, you've failed Section 8

**ShieldAI maps the following PII types to Section 8(1):**

| PII Type | Detection | DPDP Section |
|----------|-----------|-------------|
| Aadhaar | Verhoeff checksum | 8(1) |
| PAN | AAAAA9999A format | 8(1) |
| UPI ID | user@provider | 8(1) |
| Phone (+91) | 10-digit validation | 8(1) |
| Passport | A-Z + 7 digits | 8(1) |
| Bank Account | 9-18 digits + context | 8(1) |

### Section 9: Children's Data

**What it says:** Processing of children's data requires verifiable parental consent. No tracking, behavioural monitoring, or targeted advertising for children.

**LLM implication:** EdTech platforms using LLMs for tutoring minors must ensure the AI doesn't collect or process children's personal data without parental consent.

### Section 15: Data Breach Notification

**What it says:** In the event of a personal data breach, the data fiduciary must notify the Data Protection Board and affected individuals.

**LLM implication:** If a prompt injection attack successfully extracts personal data from your LLM, this constitutes a data breach under Section 15. You must notify the DPB within the prescribed timeframe.

This means **prompt injection protection isn't just good security — it's a legal requirement** under the DPDP Act.

## Data Minimization and Retention

The DPDP Act mandates data minimization — you should only collect and retain the minimum personal data necessary for your purpose.

For LLM applications, this means:

1. **Don't log raw user inputs** containing PII unless necessary
2. **Set retention limits** on conversation logs
3. **Auto-purge expired data** to comply with minimization requirements

### Implementing Compliant Data Retention

ShieldAI's data retention manager handles this automatically:

```typescript
// Configurable per customer
const RETENTION_POLICY = {
  banking: 365,      // RBI requires 1 year minimum for financial records
  fintech: 180,      // 6 months for fintech
  default: 90,       // 90 days default
  minimal: 30,       // DPDP-minimal
};

// Automatic purge runs daily at 2:00 AM IST
// Deletes scan logs where expiresAt < now()
```

## Industry-Specific Requirements

### Banking & NBFC (RBI Framework)

The RBI's framework on AI in Financial Services adds requirements beyond DPDP:

- **Data localization**: All data must reside within India
- **Explainability**: AI decisions must be auditable and explainable
- **Bias testing**: Regular testing for discriminatory outcomes
- **Consent framework**: Granular, purpose-specific consent for financial data

### Capital Markets (SEBI Circular)

SEBI's circular on AI in capital markets requires:

- **Disclosure**: AI-generated investment advice must be clearly labelled
- **No market manipulation**: AI must not generate misleading market information
- **Audit trail**: Complete record of AI decisions affecting investors

### Insurance (IRDAI Guidelines)

IRDAI requires:

- **Fair treatment**: AI must not discriminate in underwriting decisions
- **Transparency**: Policyholders must understand how AI is used in claims processing

## ShieldAI's Compliance Dashboard

ShieldAI provides a real-time compliance dashboard showing:

### Per-Regulation Traffic Lights
- 🟢 **Compliant**: No violations in the past 30 days
- 🟡 **Needs Review**: Minor violations detected, remediation recommended
- 🔴 **Violation**: Critical violations requiring immediate action

### Compliance Report
The API generates a detailed compliance report:

```json
{
  "period": "2026-05-01 to 2026-05-15",
  "overall_status": "needs_review",
  "regulations": {
    "dpdp_act": {
      "status": "needs_review",
      "violations_30d": 12,
      "sections_triggered": ["section_8_1"],
      "description": "12 instances of Aadhaar detected in LLM outputs"
    },
    "it_act": { "status": "compliant" },
    "rbi_framework": { "status": "compliant" }
  },
  "data_retention": {
    "policy_days": 90,
    "logs_pending_purge": 847,
    "next_purge": "2026-05-16T02:00:00+05:30"
  },
  "recommendations": [
    "Enable Aadhaar PII redaction in output scanning",
    "Consider 30-day retention for DPDP data minimization"
  ]
}
```

### Automated Alerts
Configure alerts for:
- Any Section 8(1) PII detection in outputs
- Injection attempts targeting financial data
- Data retention approaching limits
- New regulatory updates

## Implementation Checklist

Here's a practical checklist for DPDP compliance in LLM applications:

- [ ] **PII scanning** on all inputs and outputs (ShieldAI PII scanner)
- [ ] **Consent management** — collect specific consent for AI processing
- [ ] **Data retention policy** — set and enforce retention limits
- [ ] **Breach detection** — prompt injection protection with alerting
- [ ] **Audit trail** — log all AI decisions with explanations
- [ ] **Industry-specific compliance** — RBI/SEBI/IRDAI as applicable
- [ ] **Regular compliance reports** — monthly or quarterly reviews

## Getting Started with Compliance

```bash
# Check your compliance status
curl https://api.shieldai.dev/v1/compliance/status \
  -H "Authorization: Bearer $API_KEY"

# Generate a compliance report
curl https://api.shieldai.dev/v1/compliance/report \
  -H "Authorization: Bearer $API_KEY"
```

ShieldAI's compliance features are available on the Growth tier (₹8,750/mo) and above. The compliance dashboard, automated reports, and DPDP section mapping are included at no extra cost.

**Start your compliance journey →** [shieldai.dev](https://shieldai.dev)

---

*Tags: DPDP Act, LLM compliance, AI regulation India, data protection, RBI, SEBI, ShieldAI*
