# ShieldAI Family - Project Context

> This document provides complete context for AI coding assistants to understand, develop, and extend this project.

## What This Project Is

**ShieldAI Family** is a React Native mobile app (Expo SDK 52+) that acts as a parental control system specifically for AI chatbot apps (ChatGPT, Gemini, Copilot, Claude, Perplexity, etc.). It monitors children's conversations with AI, detecting:

- **Prompt injection attacks** (direct, indirect, encoded, multilingual)
- **Personal information leaks** (Aadhaar, PAN, UPI, phone, school name, home address)
- **Harmful content** (self-harm, drugs, weapons, cyberbullying)
- **Explicit/age-inappropriate content**
- **Multilingual threats** (Hindi, Hinglish, Tamil injection patterns)

## Target Market
India-first. Supports English, Hindi, Hinglish (Hindi in Latin script), and Tamil. Payment via Razorpay (INR). Compliance with India's DPDP Act.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              Mobile App (Expo/RN)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐│
│  │ Parent UI│ │ Child UI │ │ Background Svc   ││
│  └──────────┘ └──────────┘ │ - Accessibility  ││
│                             │ - Text Extraction││
│                             │ - Local Scan     ││
│                             └──────────────────┘│
└───────────────────┬─────────────────────────────┘
                    │ Sync (activity, alerts, settings)
┌───────────────────▼─────────────────────────────┐
│            Backend (Express + Prisma)            │
│  PostgreSQL │ Redis │ Firebase Auth │ Cron Jobs  │
└───────────────────┬─────────────────────────────┘
                    │
  ┌─────────────────┼─────────────────┐
  │                 │                 │
Razorpay       Twilio (WhatsApp)   PostHog
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Framework | React Native 0.76+ via Expo SDK 52+ |
| Navigation | Expo Router (file-based) |
| State Management | Zustand (global) + TanStack Query (server) |
| Local Storage | MMKV |
| Styling | NativeWind v4 (Tailwind for RN) |
| Auth | Firebase Auth (phone OTP) |
| Backend | Express.js + Prisma + PostgreSQL |
| Payments | Razorpay |
| Notifications | Twilio (WhatsApp/SMS), FCM |
| Analytics | PostHog |
| Crash Reporting | Sentry |
| i18n | i18next + react-i18next |
| Android Monitoring | AccessibilityService (Java native module) |
| iOS Monitoring | Network Extension (Content Filter, stub) |

## Project Structure

```
shieldai-family/
├── app/                    # Expo Router file-based routes
│   ├── (auth)/             # Onboarding & login screens
│   ├── (parent)/           # Parent dashboard, activity, controls
│   └── (child)/            # Child-facing screens
├── src/
│   ├── components/         # Reusable UI components
│   ├── services/           # Business logic (monitoring, detection, sync)
│   ├── stores/             # Zustand state stores
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helpers, rule engine, PII patterns
│   │   └── rules/          # JSON rule files for detection
│   ├── constants/          # Config, theme, plans
│   ├── i18n/               # Translations (en, hi)
│   └── styles/             # Global CSS (NativeWind)
├── android/                # Native Android modules
│   └── app/src/main/java/com/shieldai/family/
│       ├── ShieldAccessibilityService.java
│       ├── ShieldModule.java (React Native bridge)
│       └── ShieldPackage.java
├── ios/                    # iOS native stubs
│   └── ShieldAI/
│       ├── ContentFilterProvider.swift
│       └── VpnManager.swift
├── backend/                # Express API server
│   ├── prisma/schema.prisma
│   └── src/ (routes, middleware, cron)
└── docker-compose.yml
```

## Key Design Decisions

1. **On-device scanning first**: Text is scanned locally using regex rule engine before syncing to server. Minimizes latency and works offline.
2. **3-tier age filtering**: `young` (8-12), `teen` (13-15), `older_teen` (16-17) — each has different sensitivity levels and blocked categories.
3. **AccessibilityService for Android**: Only reliable way to read text from other apps without root. Requires manual user enablement.
4. **iOS is MVP/stub**: Apple's restrictions make deep monitoring impossible. Uses Network Extension (Content Filter) as a lightweight alternative.
5. **Path aliases**: `@/` maps to `./src/` in TypeScript.
6. **Rule-based + ML hybrid**: Local regex rules for speed, optional ML service for advanced classification.

## How Detection Works

1. AccessibilityService captures text from monitored AI apps
2. `textExtractor` parses the raw accessibility tree text
3. `scanService` runs text through:
   - `localEngine` (regex rule matching from `src/utils/rules/*.json`)
   - `piiScanner` (Indian PII patterns: Aadhaar, PAN, UPI, etc.)
   - `contentClassifier` (category assignment)
   - `languageDetector` (identifies Hindi/Tamil/English)
4. Results → verdict (safe/flagged/blocked) + confidence score
5. If blocked: `overlayManager` shows block screen
6. If flagged: alert sent to parent via push + stored in DB

## Development Commands

```bash
# Mobile app
cd shieldai-family
npm install
npx expo start

# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Docker (backend + db + redis)
docker-compose up -d
```

## Environment Variables

See `.env.example` in root for all required variables:
- Firebase config (auth)
- Razorpay keys (payments)
- Twilio credentials (WhatsApp/SMS)
- PostHog key (analytics)
- Sentry DSN (crash reporting)
- API URL (backend endpoint)

## Subscription Plans

| Plan | Price | Children | Features |
|------|-------|----------|----------|
| Free | ₹0 | 1 | Basic scanning, 50 scans/day |
| Basic | ₹199/mo | 2 | Unlimited scans, WhatsApp reports |
| Premium | ₹399/mo | 4 | All features, priority alerts, PDF reports |
| Family | ₹599/mo | 6 | Everything + priority support |

## Important Patterns for Contributors

- All API calls go through TanStack Query hooks in `src/hooks/`
- State that needs persistence uses MMKV via Zustand middleware
- Components use NativeWind classes (Tailwind syntax)
- New detection rules: add JSON to `src/utils/rules/`, engine auto-loads them
- New AI apps to monitor: add to `src/utils/aiAppRegistry.ts`
- Translations: add keys to both `src/i18n/en.json` and `src/i18n/hi.json`
