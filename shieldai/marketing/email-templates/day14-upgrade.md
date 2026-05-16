# Day 14 — Upgrade Email

**Subject:** You've used {{percent_used}}% of your free scans — here's what's next

---

Hi {{first_name}},

You've made **{{scans_used}} scans** this month on the Free plan. Here's what you're getting — and what you're missing:

## What Free Includes
- ✅ 1,000 scans/month
- ✅ Rule engine (200+ patterns)
- ✅ Basic entropy analysis
- ✅ 1 API key

## What You're Missing

| Feature | Free | Starter (₹2,900/mo) | Growth (₹8,750/mo) |
|---------|------|---------------------|---------------------|
| Monthly scans | 1,000 | 25,000 | 250,000 |
| ML classifier (DeBERTa) | ❌ | ✅ | ✅ |
| MuRIL (Hindi/Tamil) | ❌ | ❌ | ✅ |
| Indian PII scanning | ❌ | ✅ | ✅ |
| DPDP compliance | ❌ | ❌ | ✅ |
| Dashboard | ❌ | ✅ | ✅ |
| Custom rules | ❌ | ❌ | ✅ |
| Support | Community | Email | Priority |

## The Math

The free rule engine catches **~55% of attacks**. Adding the ML classifier (Starter) bumps that to **~85%**. The full pipeline with MuRIL and semantic similarity (Growth) reaches **95%+**.

If you're serving Indian users, the Growth plan's MuRIL classifier and DPDP compliance mapping are essential — no competitor offers these at any price.

## Upgrade in 30 Seconds

1. Go to [app.shieldai.dev/billing](https://app.shieldai.dev/billing)
2. Select your plan
3. Indian cards, UPI, and net banking accepted
4. Instant activation — no downtime

**India pricing:** Our Growth plan at ₹8,750/mo is less than half of what Lakera charges for English-only detection.

## Not Ready to Upgrade?

No problem. The `@shieldai/detect-lite` npm package is free forever with all 200+ rules. It covers the basics. When you need ML-powered detection, the API is one API key away.

```bash
npm install @shieldai/detect-lite
```

— The ShieldAI Team

---
*[Unsubscribe]({{unsubscribe_url}})*
