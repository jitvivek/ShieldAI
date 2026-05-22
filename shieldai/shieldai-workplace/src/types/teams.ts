import { Activity, ConversationReference } from 'botbuilder';

export interface TeamsMessageContext {
  activity: Activity;
  conversationRef: Partial<ConversationReference>;
  channelId: string;
  userId: string;
  text: string;
  isGroupChat: boolean;
}

export interface TeamsAdaptiveCardAction {
  type: 'send_anyway' | 'edit_message' | 'view_details';
  messageId?: string;
  scanId?: string;
}
