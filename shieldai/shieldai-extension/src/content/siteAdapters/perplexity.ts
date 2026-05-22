import type { SiteAdapter } from '../../shared/types';

export const perplexityAdapter: SiteAdapter = {
  name: 'Perplexity',
  matchUrls: ['perplexity.ai'],

  getInputElement(): HTMLElement | null {
    return document.querySelector('textarea[placeholder*="Ask"]') ||
           document.querySelector('textarea[aria-label*="Search"]') ||
           document.querySelector('textarea');
  },

  getSubmitButton(): HTMLElement | null {
    return document.querySelector('button[aria-label="Submit"]') ||
           document.querySelector('button[type="submit"]') ||
           document.querySelector('button svg[data-icon="arrow-right"]')?.closest('button') || null;
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
