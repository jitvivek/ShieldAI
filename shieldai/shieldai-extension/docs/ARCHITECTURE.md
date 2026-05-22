# ShieldAI Guard — Architecture

## Overview

ShieldAI Guard is a Chrome Manifest V3 browser extension that intercepts messages sent to AI chatbots and scans them for harmful content, PII exposure, and injection attacks before they reach the AI model.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Web Page (AI Site)                  │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Content Script (injected per-site)             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │ │
│  │  │Site      │  │Interceptor│  │PII           │  │ │
│  │  │Adapter   │  │(Enter/Btn)│  │Highlighter   │  │ │
│  │  └──────────┘  └─────┬────┘  └──────────────┘  │ │
│  │                       │ chrome.runtime.sendMessage │ │
│  └───────────────────────┼─────────────────────────┘ │
└───────────────────────────┼─────────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │   Background Service Worker  │
              │  ┌────────────────────────┐  │
              │  │  Message Handler       │  │
              │  └────────┬───────────────┘  │
              │           │                  │
              │  ┌────────▼───────────────┐  │
              │  │   API Client           │  │
              │  │ (POST /v1/detect)      │──────► ShieldAI Cloud API
              │  └────────────────────────┘  │     (ML + Rules + Semantic)
              │           │ (fallback)       │
              │  ┌────────▼───────────────┐  │
              │  │   Offline Engine       │  │
              │  │  (Rules + PII local)   │  │
              │  └────────────────────────┘  │
              │  ┌────────────────────────┐  │
              │  │  Notification Manager  │  │
              │  │  (Badge + Alerts)      │  │
              │  └────────────────────────┘  │
              └────────────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │    Chrome Storage           │
              │  ├─ sync: settings, apiKey  │
              │  └─ local: history, stats   │
              └────────────────────────────┘
```

## Component Roles

### Content Script
- Injected into supported AI sites (ChatGPT, Gemini, Claude, etc.)
- Uses site-specific adapters to find input elements
- Intercepts Enter key and submit button clicks
- Shows warning/block overlays (Shadow DOM isolated)
- Highlights PII in real-time (debounced 500ms)

### Background Service Worker
- Receives scan requests from content scripts
- Calls ShieldAI API for full ML detection
- Falls back to offline engine if API unreachable
- Manages badge counter and notifications
- Enforces daily scan limits (free tier: 50/day)
- Stores scan history (last 100 items)

### Offline Engine
- 200+ regex patterns across 5 categories
- PII scanner (Aadhaar, PAN, UPI, phone, email, credit card)
- Language detection (Hindi, Tamil, Hinglish, English)
- Score calculation with weighted fusion
- Always available — no network dependency

### Popup UI
- 400x500px React app
- Three tabs: Status, History, Quick Settings
- Real-time stats from chrome.storage.local
- Zustand state management

### Options Page
- Full-page React app with sidebar navigation
- General (API config), Protection (toggles), Block Rules (custom)
- Parental Controls (PIN-locked, age tiers, activity logging)
- Notifications preferences

## Data Flow

1. User types message in AI chatbot
2. Content script detects input via site adapter
3. User presses Enter or clicks Send
4. Content script prevents default, sends text to background
5. Background calls API (or offline engine)
6. Response returned to content script
7. Content script allows/warns/blocks based on verdict
8. Stats and history updated in chrome.storage

## Security Principles

- **Fail open:** If scanning fails, allow the message (don't break the page)
- **Shadow DOM isolation:** Overlays never affect host page styles
- **Local-first PII:** PII scanning always runs locally, never sent to server raw
- **Defensive coding:** Try/catch wrappers everywhere in content scripts
- **No data retention:** API processes and discards — never stores raw messages
- **PIN protection:** Parental settings can't be changed without PIN
