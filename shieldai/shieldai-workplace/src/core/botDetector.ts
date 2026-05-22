import pino from 'pino';
import type { BotInfo } from '../types/common';

const logger = pino({ name: 'bot-detector' });

// Known Microsoft Copilot app IDs
const KNOWN_TEAMS_BOT_IDS = new Set([
  '2ac23cfe-94f0-4b3e-b19e-5a0db0c9559c', // Microsoft 365 Copilot
  'ab1eba98-9c5f-4fdc-bbcb-1f7b2f686557', // Bing/Copilot
]);

// In-memory cache of configured bots (loaded from DB on startup)
const configuredBots = new Map<string, BotInfo>();

export function registerBot(bot: BotInfo): void {
  configuredBots.set(`${bot.platform}:${bot.userId}`, bot);
}

export function unregisterBot(platform: string, userId: string): void {
  configuredBots.delete(`${platform}:${userId}`);
}

export function isTeamsBot(userId: string, role?: string): boolean {
  if (role === 'bot') return true;
  if (KNOWN_TEAMS_BOT_IDS.has(userId)) return true;
  const key = `teams:${userId}`;
  const bot = configuredBots.get(key);
  return bot?.isActive === true;
}

export function isSlackBot(userId: string, isBot?: boolean): boolean {
  if (isBot === true) return true;
  const key = `slack:${userId}`;
  const bot = configuredBots.get(key);
  return bot?.isActive === true;
}

export function loadBotsFromDb(bots: BotInfo[]): void {
  for (const bot of bots) {
    registerBot(bot);
  }
  logger.info({ count: bots.length }, 'Loaded bot configs from DB');
}

export function getConfiguredBots(): BotInfo[] {
  return Array.from(configuredBots.values());
}
