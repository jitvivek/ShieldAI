# Privacy Policy — ShieldAI Guard Browser Extension

**Last Updated:** May 21, 2026  
**Effective Date:** May 21, 2026  
**Company:** ShieldAI Technologies  
**Contact:** privacy@shieldai.dev

---

## 1. Overview

ShieldAI Guard ("the Extension") is a browser extension that scans messages you send to AI chatbots to protect you from harmful content, personal data exposure, and prompt injection attacks. This privacy policy explains what data we collect, how we process it, and your rights.

## 2. Data We Collect

### 2.1 Message Content (Transient Processing Only)
When you send a message on a supported AI platform, the Extension scans the message text. This text is:
- Processed locally by the built-in rule engine and PII scanner (no data leaves your device for local-only detection)
- Sent to the ShieldAI API (`api.shieldai.dev`) for ML-powered detection **only if** you have configured an API key
- **Never stored on our servers** beyond the time needed to compute a detection result (typically < 200ms)
- **Never used for training** ML models or any other purpose

### 2.2 Scan Metadata
We store minimal metadata for each scan on our servers (if API is used):
- Timestamp
- Verdict (safe/suspicious/malicious)
- Risk score
- Detected category (e.g., "pii_exposure", "harmful_content")
- Detected language
- **NOT** the original message text

### 2.3 PII Handling
When Personal Identifiable Information is detected (Aadhaar, PAN, UPI, phone, email, credit card):
- The PII is **masked** before any logging (e.g., "XXXX-XXXX-3456")
- Raw PII values are **never stored** in plaintext on our servers
- Raw PII values are **never transmitted** to our servers — only the masked version appears in logs

### 2.4 Local Storage
The Extension stores the following on your device (via Chrome Storage):
- Your settings and preferences
- API key (encrypted via chrome.storage.sync)
- Last 100 scan results (stored locally in chrome.storage.local)
- Daily statistics (scans count, blocks count)

### 2.5 Parental Controls Data
If parental controls are enabled:
- Child activity logs are stored locally on the device
- If a parent email is configured, weekly summary reports are sent (containing only aggregated statistics, not raw message content)
- Activity data is encrypted at rest using the configured PIN as a key component

## 3. Data Processing Location

All API processing occurs on servers located in **India** (Mumbai region). No data is transferred outside of India, ensuring compliance with the Digital Personal Data Protection (DPDP) Act, 2023.

## 4. Data Retention

- **API scan logs (metadata only):** Retained for 30 days, then automatically deleted
- **Local scan history:** Retained for the last 100 scans, automatically rotated
- **Account data:** Retained until you delete your account
- **Custom retention:** Enterprise customers can configure custom retention periods

## 5. Third-Party Sharing

We do **NOT**:
- Sell your data to any third party
- Share your data with advertisers
- Provide access to your data to any third party except as required by Indian law (court order, law enforcement with proper legal process)

## 6. Your Rights (DPDP Act Compliance)

Under the Digital Personal Data Protection Act, 2023, you have the right to:
- **Access:** Request a copy of all data we have about you
- **Correction:** Request correction of inaccurate data
- **Erasure:** Request deletion of all your data
- **Nominate:** Nominate a person to exercise your rights on your behalf

To exercise any of these rights, email privacy@shieldai.dev.

## 7. Data Deletion

You can delete all your data at any time:
- **Local data:** Open Extension Options → General → "Clear all local data"
- **Server data:** Email privacy@shieldai.dev with your account email, or use the "Delete Account" option in the ShieldAI web dashboard

## 8. Children's Privacy

ShieldAI Guard may be used by parents to monitor children's AI interactions. When used in supervised mode:
- Children's interaction data is accessible only to the parent account holder
- We comply with applicable Indian regulations regarding children's data
- We do not knowingly collect data from children under 8 years of age
- Parents can delete all child activity data from the Extension settings

## 9. Security Measures

- All API communications use TLS 1.3 encryption
- API keys are stored using Chrome's encrypted storage
- PII is masked before any server-side logging
- Server infrastructure follows SOC 2 Type II security controls
- Regular security audits and penetration testing

## 10. Permissions Explanation

The Extension requests these Chrome permissions:

| Permission | Purpose |
|------------|---------|
| `storage` | Save your settings and scan history locally |
| `notifications` | Alert you when harmful content is blocked |
| `activeTab` | Read the current tab URL to determine which AI site you're using |
| Host permissions (AI sites) | Inject content scripts to scan messages before they're sent |

## 11. Changes to This Policy

We may update this privacy policy. Users will be notified of material changes via:
- Extension update notification
- Email (if registered)
- Banner in the Extension popup

## 12. Contact

For privacy concerns, data requests, or questions:
- **Email:** privacy@shieldai.dev
- **Address:** ShieldAI Technologies, India
- **Data Protection Officer:** dpo@shieldai.dev

## 13. Grievance Officer (DPDP Act)

As required under the DPDP Act, 2023:
- **Grievance Officer:** [Name]
- **Email:** grievance@shieldai.dev
- **Response time:** Within 7 days of receiving your complaint
