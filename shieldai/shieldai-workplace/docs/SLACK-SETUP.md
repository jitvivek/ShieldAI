# ShieldAI Workplace — Slack Setup

## Prerequisites
- Slack workspace admin access
- Node.js 20+

## Step 1: Create Slack App
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From manifest**
3. Select your workspace
4. Paste the contents of `src/slack/manifest.yaml`
5. Click **Create**

## Step 2: Install App to Workspace
1. In app settings → **Install App** → Install to Workspace
2. Authorize the requested permissions
3. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

## Step 3: Enable Socket Mode
1. Go to **Socket Mode** in app settings
2. Enable Socket Mode
3. Generate an **App-Level Token** with `connections:write` scope
4. Copy the token (starts with `xapp-`)

## Step 4: Configure Environment
```bash
cp .env.example .env
```
Set these values:
```
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-token
```

## Step 5: Add App to Channels
1. Go to a Slack channel where AI bots operate
2. Click channel name → **Integrations** → Add apps
3. Add **ShieldAI**

## Testing
- In a channel with the bot, type: `My Aadhaar is 1234 5678 9012`
- The bot should send an ephemeral warning message
- Type `/shieldai status` to see scan statistics
- Type `/shieldai config` for configuration options
