# ShieldAI Workplace — Microsoft Teams Setup

## Prerequisites
- Microsoft 365 admin account
- Azure Bot resource created in Azure Portal
- Node.js 20+

## Step 1: Create Azure Bot Resource
1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Azure Bot** resource
3. Select **Multi Tenant** for bot type
4. Note down the **App ID** and **App Password**

## Step 2: Configure Environment
```bash
cp .env.example .env
```
Set these values in `.env`:
```
TEAMS_APP_ID=<your-azure-bot-app-id>
TEAMS_APP_PASSWORD=<your-azure-bot-password>
```

## Step 3: Set Messaging Endpoint
In Azure Portal → Bot resource → Configuration:
- Set **Messaging endpoint** to: `https://your-domain.com/api/teams/messages`

## Step 4: Create Teams App Package
1. Navigate to `src/teams/manifest/`
2. Replace `{{TEAMS_APP_ID}}` in `manifest.json` with your Bot App ID
3. Add `color.png` (192x192) and `outline.png` (32x32) icons
4. Zip the folder contents: `manifest.json`, `color.png`, `outline.png`

## Step 5: Upload to Teams
1. Go to **Teams Admin Center** → Manage apps → Upload new app
2. Upload the zip file
3. Approve and assign the app to users/groups

## Step 6: Add Bot to Channels
1. In Teams, go to a channel with AI bots (e.g., Copilot)
2. Click **+** → Add an app → Search "ShieldAI Workplace"
3. Add to the channel

## Testing
- Send a message containing a PAN number: `My PAN is ABCPD1234E`
- The bot should respond with a warning/block adaptive card
- Type `@ShieldAI status` to see scan statistics
