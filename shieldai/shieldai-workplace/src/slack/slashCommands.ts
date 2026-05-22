import type { App } from '@slack/bolt';
import pino from 'pino';
import { buildStatusBlocks } from './blockKit';

const logger = pino({ name: 'slack-commands' });

export function registerSlashCommands(app: App): void {
  app.command('/shieldai', async ({ command, ack, respond }) => {
    await ack();

    const subcommand = command.text.trim().toLowerCase();

    switch (subcommand) {
      case 'status': {
        const blocks = buildStatusBlocks({
          scansToday: 0,
          blocked: 0,
          flagged: 0,
          piiCaught: 0,
        });
        await respond({ blocks, response_type: 'ephemeral' });
        break;
      }

      case 'config': {
        await respond({
          response_type: 'ephemeral',
          text: '⚙️ ShieldAI configuration is available in the admin dashboard.',
        });
        break;
      }

      case 'report': {
        await respond({
          response_type: 'ephemeral',
          text: '📊 Generating scan report… This will be sent to your DMs shortly.',
        });
        break;
      }

      default:
        await respond({
          response_type: 'ephemeral',
          text: 'Available commands: `/shieldai status`, `/shieldai config`, `/shieldai report`',
        });
    }
  });
}
