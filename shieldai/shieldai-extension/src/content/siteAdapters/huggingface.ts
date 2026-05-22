import type { SiteAdapter } from '../../shared/types';

export const huggingfaceAdapter: SiteAdapter = {
  name: 'HuggingFace',
  matchUrls: ['huggingface.co/chat'],

  getInputElement(): HTMLElement | null {
    return document.querySelector('textarea[placeholder*="message"]') ||
           document.querySelector('textarea[enterkeyhint="send"]') ||
           document.querySelector('.chat-input textarea');
  },

  getSubmitButton(): HTMLElement | null {
    return document.querySelector('button[type="submit"]') ||
           document.querySelector('form button:last-of-type');
  },

  extractText(input: HTMLElement): string {
    if (input.tagName === 'TEXTAREA') {
      return (input as HTMLTextAreaElement).value;
    }
    return input.textContent || '';
  },

  blockSubmission(_input: HTMLElement): void {},
  restoreSubmission(_input: HTMLElement): void {},
  injectWarning(_message: string, _severity: 'warning' | 'blocked'): void {},
  removeWarning(): void {},
};
