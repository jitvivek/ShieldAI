export interface SlackMessageContext {
  teamId: string;
  channelId: string;
  userId: string;
  text: string;
  ts: string;
  threadTs?: string;
  isBot: boolean;
}

export interface SlackBlockAction {
  actionId: string;
  value: string;
  userId: string;
  channelId: string;
}
