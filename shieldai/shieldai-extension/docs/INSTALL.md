# ShieldAI Guard — Installation Guide

## Install from Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store listing](https://chrome.google.com/webstore/detail/shieldai-guard) *(coming soon)*
2. Click "Add to Chrome"
3. Confirm the permissions
4. The 🛡️ icon appears in your toolbar — you're protected!

## Install from Source (Developer Mode)

### Prerequisites
- Node.js 20+
- npm or pnpm

### Build Steps

```bash
cd shieldai-extension
npm install
npm run build
```

### Load in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `dist/` folder
5. The extension is now active

### Load in Edge

1. Open `edge://extensions/`
2. Enable "Developer mode" (bottom-left toggle)
3. Click "Load unpacked"
4. Select the `dist/` folder

## Configuration

### Free Tier (No API key needed)
- Basic rule-based detection (200+ patterns)
- PII scanning (Aadhaar, PAN, UPI, phone)
- 50 scans per day
- Works offline

### Premium Tier (With API key)
1. Sign up at [shieldai.dev](https://shieldai.dev)
2. Generate an API key from the dashboard
3. Open the extension options (right-click icon → Settings)
4. Paste your API key in the "General" tab
5. Full ML-powered detection is now active

## Supported AI Platforms

| Platform | URL | Status |
|----------|-----|--------|
| ChatGPT | chatgpt.com | ✅ Full support |
| Google Gemini | gemini.google.com | ✅ Full support |
| Claude | claude.ai | ✅ Full support |
| Microsoft Copilot | copilot.microsoft.com | ✅ Full support |
| Perplexity | perplexity.ai | ✅ Full support |
| HuggingFace Chat | huggingface.co/chat | ✅ Full support |
| Other AI sites | * | ⚡ Generic support |

## Parental Controls Setup

1. Open extension options
2. Go to "Parental Controls"
3. Enable "Supervised Mode"
4. Set a 4-digit PIN
5. Choose the child's age tier
6. Enable activity logging
7. Add parent email for weekly reports

The child cannot disable the extension or change settings without the PIN.

## Troubleshooting

- **Extension not working on a site?** Refresh the page after installing.
- **Badge not updating?** Check that "Badge counter" is enabled in settings.
- **API connection failed?** Verify your API key and check shieldai.dev status.
- **False positives?** Adjust sensitivity in Protection settings, or add exceptions in Block Rules.
