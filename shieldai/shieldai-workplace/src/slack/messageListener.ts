import type { WebClient } from '@slack/web-api';
import pino from 'pino';
import { scan } from '../core/scanner';
import { isSlackBot } from '../core/botDetector';
import { buildAuditEntry, logAudit } from '../core/auditLogger';
import { notifyAdmins } from '../core/notificationService';
import { buildWarningBlocks, buildBlockedBlocks } from './blockKit';
import type { ScanRequest } from '../types/common';

const logger = pino({ name: 'slack-listener' });

const DEFAULT_ORG_ID = 'default';

export async function handleSlackMessage(
  message: Record<string, unknown>,
  client: WebClient
): Promise<void> {
  // Skip bot messages, edits, and subtype messages
  if (message.subtype || message.bot_id) return;

  const text = message.text as string | undefined;
  const userId = message.user as string | undefined;
  const channelId = message.channel as string | undefined;
  const ts = message.ts as string | undefined;
  const teamId = message.team as string | undefined;

  if (!text?.trim() || !userId || !channelId) return;

  // Check if channel has any known AI bots
  const channelHasBot = await checkChannelForBots(client, channelId);
  if (!channelHasBot) return;

  const startMs = Date.now();
  const request: ScanRequest = {
    text,
    userId,
    platform: 'slack',
    channelId,
    isToBot: true,
    isBotResponse: false,
    orgId: teamId || DEFAULT_ORG_ID,
  };

  const result = await scan(request);
  const latencyMs = Date.now() - startMs;
  logAudit(buildAuditEntry(request, result, latencyMs));

  if (result.shouldBlock) {
    // Delete the original message
    try {
      await client.chat.delete({ channel: channelId, ts: ts! });
    } catch (err) {
      logger.warn({ err }, 'Could not delete blocked message');
    }

    // Send ephemeral replacement
    await client.chat.postEphemeral({
      channel: channelId,
      user: userId,
      blocks: buildBlockedBlocks(result),
      text: result.userMessage,
    });

    await notifyAdmins({
      orgId: request.orgId,
      platform: 'slack',
      type: 'block',
      summary: result.userMessage,
      details: result.adminMessage,
      adminEmails: [],
    });
  } else if (result.shouldFlag) {
    await client.chat.postEphemeral({
      channel: channelId,
      user: userId,
      blocks: buildWarningBlocks(result),
      text: result.userMessage,
    });
  }
}

async function checkChannelForBots(client: WebClient, channelId: string): Promise<boolean> {
  try {
    const result = await client.conversations.members({ channel: channelId, limit: 100 });
    const members = result.members || [];
    for (const memberId of members) {
      try {
        const info = await client.users.info({ user: memberId });
        if (info.user?.is_bot && isSlackBot(memberId, true)) {
          return true;
        }
      } catch {
        // Ignore lookup failures
      }
    }
  } catch {
    // If we can't check, assume no bots (safe default)
  }
  return false;
}
