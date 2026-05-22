import type { SiteAdapter } from '../../shared/types';

export const geminiAdapter: SiteAdapter = {
  name: 'Gemini',
  matchUrls: ['gemini.google.com'],

  getInputElement(): HTMLElement | null {
    return document.querySelector('div[contenteditable="true"].ql-editor') ||
           document.querySelector('div[contenteditable="true"][aria-label*="prompt"]') ||
           document.querySelector('rich-textarea div[contenteditable="true"]');
  },

  getSubmitButton(): HTMLElement | null {
    return document.querySelector('button[aria-label="Send message"]') ||
           document.querySelector('.send-button') ||
           document.querySelector('button[mat-icon-button][aria-label*="Send"]');
  },

  extractText(input: HTMLElement): string {
    return input.textContent || '';
  },

  blockSubmission(_input: HTMLElement): void {},
  restoreSubmission(_input: HTMLElement): void {},
  injectWarning(_message: string, _severity: 'warning' | 'blocked'): void {},
  removeWarning(): void {},
};
