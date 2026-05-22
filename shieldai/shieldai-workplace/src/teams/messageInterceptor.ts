import { TurnContext, MessageFactory, CardFactory } from 'botbuilder';
import pino from 'pino';
import { scan } from '../core/scanner';
import { isTeamsBot } from '../core/botDetector';
import { buildAuditEntry, logAudit } from '../core/auditLogger';
import { notifyAdmins } from '../core/notificationService';
import { buildWarningCard, buildBlockCard } from './adaptiveCards';
import type { ScanRequest } from '../types/common';

const logger = pino({ name: 'teams-interceptor' });

// Default org ID for unregistered Teams tenants
const DEFAULT_ORG_ID = 'default';

export async function interceptTeamsMessage(context: TurnContext): Promise<void> {
  const activity = context.activity;
  const text = activity.text?.trim();
  if (!text) return;

  const userId = activity.from?.id || 'unknown';
  const channelId = activity.channelId || 'unknown';
  const conversationId = activity.conversation?.id || '';

  // Determine if this message involves a bot
  const fromRole = activity.from?.role;
  const isBotMessage = isTeamsBot(userId, fromRole);

  // Check if message mentions or is directed at a bot
  const mentions = activity.entities?.filter((e) => e.type === 'mention') || [];
  const mentionsBot = mentions.some((m) => {
    const mentionedId = (m as { mentioned?: { id?: string } }).mentioned?.id;
    return mentionedId ? isTeamsBot(mentionedId) : false;
  });

  // Only scan messages to/from bots
  if (!isBotMessage && !mentionsBot) return;

  const startMs = Date.now();
  const request: ScanRequest = {
    text,
    userId,
    platform: 'teams',
    channelId: conversationId,
    isToBot: !isBotMessage && mentionsBot,
    isBotResponse: isBotMessage,
    orgId: DEFAULT_ORG_ID,
  };

  const result = await scan(request);
  const latencyMs = Date.now() - startMs;
  logAudit(buildAuditEntry(request, result, latencyMs));

  if (result.shouldBlock) {
    // Send block card as reply
    const card = buildBlockCard(result);
    await context.sendActivity(MessageFactory.attachment(CardFactory.adaptiveCard(card)));

    // Notify admins
    await notifyAdmins({
      orgId: request.orgId,
      platform: 'teams',
      type: 'block',
      summary: result.userMessage,
      details: result.adminMessage,
      adminEmails: [],
    });
  } else if (result.shouldFlag) {
    const card = buildWarningCard(result);
    await context.sendActivity(MessageFactory.attachment(CardFactory.adaptiveCard(card)));
  }
}
