import { App, LogLevel } from '@slack/bolt';
import pino from 'pino';
import { handleSlackMessage } from './messageListener';
import { registerSlashCommands } from './slashCommands';

const logger = pino({ name: 'slack-app' });

let slackApp: App | null = null;

export function createSlackApp(): App | null {
  const token = process.env.SLACK_BOT_TOKEN;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  const appToken = process.env.SLACK_APP_TOKEN;

  if (!token || !signingSecret) {
    logger.warn('Slack credentials not configured — Slack integration disabled');
    return null;
  }

  const app = new App({
    token,
    signingSecret,
    appToken,
    socketMode: !!appToken,
    logLevel: LogLevel.INFO,
  });

  // Register message listener
  app.message(async ({ message, client }) => {
    try {
      await handleSlackMessage(message as unknown as Record<string, unknown>, client);
    } catch (err) {
      logger.error({ err }, 'Error handling Slack message');
    }
  });

  // Register slash commands
  registerSlashCommands(app);

  // Handle button actions from warning blocks
  app.action('shieldai_send_anyway', async ({ ack }) => {
    await ack();
    // User chose to send anyway — no further action needed
  });

  app.action('shieldai_edit_message', async ({ ack, respond }) => {
    await ack();
    await respond({ text: '✏️ Please edit your message and resend.', replace_original: false });
  });

  slackApp = app;
  return app;
}

export async function startSlackApp(): Promise<void> {
  if (!slackApp) return;
  if (process.env.SLACK_APP_TOKEN) {
    await slackApp.start();
    logger.info('Slack app started in Socket Mode');
  }
}

export function getSlackApp(): App | null {
  return slackApp;
}
