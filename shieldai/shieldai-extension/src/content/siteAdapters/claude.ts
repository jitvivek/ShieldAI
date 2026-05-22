import type { SiteAdapter } from '../../shared/types';

export const claudeAdapter: SiteAdapter = {
  name: 'Claude',
  matchUrls: ['claude.ai'],

  getInputElement(): HTMLElement | null {
    return document.querySelector('div[contenteditable="true"].ProseMirror') ||
           document.querySelector('div[contenteditable="true"][aria-label*="message"]') ||
           document.querySelector('fieldset div[contenteditable="true"]');
  },

  getSubmitButton(): HTMLElement | null {
    return document.querySelector('button[aria-label="Send Message"]') ||
           document.querySelector('button[aria-label="Send message"]') ||
           document.querySelector('fieldset button[type="button"]:last-of-type');
  },

  extractText(input: HTMLElement): string {
    return input.textContent || '';
  },

  blockSubmission(_input: HTMLElement): void {},
  restoreSubmission(_input: HTMLElement): void {},
  injectWarning(_message: string, _severity: 'warning' | 'blocked'): void {},
  removeWarning(): void {},
};
