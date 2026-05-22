import {
  CloudAdapter,
  ConfigurationBotFrameworkAuthentication,
  ConfigurationBotFrameworkAuthenticationOptions,
} from 'botbuilder';
import pino from 'pino';
import { createApp } from './app';
import { ShieldAIBot } from './teams/bot';
import { createSlackApp, startSlackApp } from './slack/app';
import { registerAdminRoutes } from './admin/routes';

const logger = pino({ name: 'server' });

async function main(): Promise<void> {
  const PORT = parseInt(process.env.PORT || '3001', 10);
  const app = createApp();

  // --- Teams Bot Setup ---
  const teamsAppId = process.env.TEAMS_APP_ID;
  const teamsAppPassword = process.env.TEAMS_APP_PASSWORD;

  if (teamsAppId && teamsAppPassword) {
    const authConfig: ConfigurationBotFrameworkAuthenticationOptions = {
      MicrosoftAppId: teamsAppId,
      MicrosoftAppPassword: teamsAppPassword,
      MicrosoftAppType: 'MultiTenant',
    };
    const botAuth = new ConfigurationBotFrameworkAuthentication(authConfig);
    const adapter = new CloudAdapter(botAuth);

    adapter.onTurnError = async (context, error) => {
      logger.error({ err: error }, 'Teams bot turn error');
      await context.sendActivity('ShieldAI encountered an error. Please try again.');
    };

    const bot = new ShieldAIBot();

    app.post('/api/teams/messages', async (req, res) => {
      await adapter.process(req, res, async (context) => {
        await bot.run(context);
      });
    });

    logger.info('Teams bot endpoint registered at /api/teams/messages');
  } else {
    logger.warn('Teams credentials not configured — Teams integration disabled');
  }

  // --- Slack App Setup ---
  const slackApp = createSlackApp();
  if (slackApp && !process.env.SLACK_APP_TOKEN) {
    // If not using Socket Mode, mount Slack events on Express
    const slackReceiver = slackApp as unknown as { receiver?: { app?: ReturnType<typeof import('express')> } };
    if (slackReceiver.receiver?.app) {
      app.use('/api/slack', slackReceiver.receiver.app);
    }
  }

  // --- Admin API ---
  registerAdminRoutes(app);

  // --- Start ---
  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'ShieldAI Workplace server started');
  });

  // Start Slack Socket Mode if configured
  if (slackApp && process.env.SLACK_APP_TOKEN) {
    await startSlackApp();
  }
}

main().catch((err) => {
  const logger = pino({ name: 'server' });
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
