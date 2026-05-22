import {
  ActivityHandler,
  TurnContext,
  MessageFactory,
  CardFactory,
  TeamsActivityHandler,
} from 'botbuilder';
import pino from 'pino';
import { interceptTeamsMessage } from './messageInterceptor';

const logger = pino({ name: 'teams-bot' });

export class ShieldAIBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context: TurnContext, next) => {
      try {
        await interceptTeamsMessage(context);
      } catch (err) {
        logger.error({ err }, 'Error processing Teams message');
      }
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      for (const member of context.activity.membersAdded || []) {
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity(
            MessageFactory.text(
              '🛡️ ShieldAI Workplace is now monitoring AI bot interactions in this channel. ' +
                'Messages to AI bots will be scanned for PII and harmful content.'
            )
          );
        }
      }
      await next();
    });

    this.onInstallationUpdate(async (context, next) => {
      if (context.activity.action === 'add') {
        logger.info(
          { channelId: context.activity.channelId },
          'ShieldAI bot installed in channel'
        );
      }
      await next();
    });
  }
}
