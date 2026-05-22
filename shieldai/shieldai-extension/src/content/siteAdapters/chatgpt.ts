import type { SiteAdapter } from '../../shared/types';

export const chatgptAdapter: SiteAdapter = {
  name: 'ChatGPT',
  matchUrls: ['chat.openai.com', 'chatgpt.com'],

  getInputElement(): HTMLElement | null {
    return document.querySelector('#prompt-textarea') ||
           document.querySelector('div[contenteditable="true"][id="prompt-textarea"]') ||
           document.querySelector('textarea[data-id="root"]') ||
           document.querySelector('div[contenteditable="true"].ProseMirror') ||
           document.querySelector('form textarea');
  },

  getSubmitButton(): HTMLElement | null {
    return document.querySelector('[data-testid="send-button"]') ||
           document.querySelector('button[aria-label="Send prompt"]') ||
           document.querySelector('button[aria-label="Send message"]') ||
           document.querySelector('form button[data-testid="fruitjuice-send-button"]') ||
           document.querySelector('form button:not([disabled])[class*="send"]') ||
           document.querySelector('form button[type="submit"]');
  },

  extractText(input: HTMLElement): string {
    if (input.tagName === 'TEXTAREA') {
      return (input as HTMLTextAreaElement).value;
    }
    return input.textContent || '';
  },

  blockSubmission(_input: HTMLElement): void {
    // Handled by interceptor preventing event propagation
  },

  restoreSubmission(_input: HTMLElement): void {
    // No-op for ChatGPT — the event re-dispatch handles it
  },

  injectWarning(_message: string, _severity: 'warning' | 'blocked'): void {
    // Delegated to overlay.ts
  },

  removeWarning(): void {
    // Delegated to overlay.ts
  },
};
