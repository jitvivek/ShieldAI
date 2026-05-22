import { TurnContext, CardFactory, MessageFactory } from 'botbuilder';
import { buildConfigCard, buildStatsCard } from './adaptiveCards';
import pino from 'pino';

const logger = pino({ name: 'teams-config' });

export async function handleConfigRequest(context: TurnContext): Promise<void> {
  const text = context.activity.text?.toLowerCase().trim() || '';

  if (text.includes('settings') || text.includes('config')) {
    const card = buildConfigCard();
    await context.sendActivity(
      MessageFactory.attachment(CardFactory.adaptiveCard(card))
    );
  } else if (text.includes('stats') || text.includes('status')) {
    const card = buildStatsCard({
      scansToday: 0,
      blocked: 0,
      flagged: 0,
      piiCaught: 0,
    });
    await context.sendActivity(
      MessageFactory.attachment(CardFactory.adaptiveCard(card))
    );
  }
}
