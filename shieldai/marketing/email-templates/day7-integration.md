# Day 7 — Integration Email

**Subject:** 3 ways to integrate ShieldAI (pick one)

---

Hi {{first_name}},

You've been using ShieldAI for a week — here are three ways to integrate it into your production stack:

## Option 1: REST API (Any Language)

```python
import httpx

result = httpx.post("https://api.shieldai.dev/v1/detect",
    json={"input": user_prompt},
    headers={"Authorization": f"Bearer {API_KEY}"}
).json()

if result["verdict"] == "BLOCK":
    return "Sorry, I can't process that request."
```

## Option 2: LangChain Callback

```python
from shieldai import ShieldAICallback

llm = ChatOpenAI(callbacks=[ShieldAICallback(api_key=API_KEY)])
# Every prompt is automatically scanned before reaching the LLM
```

## Option 3: Offline Package (No API Calls)

```bash
npm install @shieldai/detect-lite
```

```typescript
import { detect } from '@shieldai/detect-lite';
const result = detect(userInput);
// Runs locally — includes all 200+ rules + Hindi/Tamil detection
```

## Pro Tip: Enable PII Scanning

If you're building for Indian fintech, enable PII detection to catch Aadhaar, PAN, and UPI leakage. ShieldAI maps each detection to the specific DPDP Act section — your compliance team will thank you.

## Your Stats This Week

- Scans: **{{scans_used}}**
- Blocked: **{{blocked_count}}**
- Languages detected: **{{languages}}**

Need help with integration? Reply to this email — we respond within 4 hours.

— The ShieldAI Team

---
*[Unsubscribe]({{unsubscribe_url}})*
