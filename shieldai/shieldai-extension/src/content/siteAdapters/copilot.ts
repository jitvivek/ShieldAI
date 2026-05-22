import type { SiteAdapter } from '../../shared/types';

export const copilotAdapter: SiteAdapter = {
  name: 'Copilot',
  matchUrls: ['copilot.microsoft.com'],

  getInputElement(): HTMLElement | null {
    return document.querySelector('textarea#searchbox') ||
           document.querySelector('textarea[name="q"]') ||
           document.querySelector('#searchbox');
  },

  getSubmitButton(): HTMLElement | null {
    return document.querySelector('button[aria-label="Submit"]') ||
           document.querySelector('button[type="submit"]');
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
