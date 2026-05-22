import type { SiteAdapter } from '../../shared/types';

// Generic adapter that works on any page with a textarea or contenteditable
const genericAdapter: SiteAdapter = {
  name: 'Generic',
  matchUrls: [],

  getInputElement(): HTMLElement | null {
    return document.querySelector('textarea:focus') ||
           document.querySelector('div[contenteditable="true"]:focus') ||
           document.querySelector('textarea') ||
           document.querySelector('div[contenteditable="true"]');
  },

  getSubmitButton(): HTMLElement | null {
    const textarea = this.getInputElement();
    if (!textarea) return null;

    // Look for submit button near the textarea
    const form = textarea.closest('form');
    if (form) {
      return form.querySelector('button[type="submit"]') ||
             form.querySelector('button:last-of-type');
    }

    // Look for send-like buttons nearby
    const parent = textarea.parentElement;
    if (parent) {
      return parent.querySelector('button') ||
             parent.nextElementSibling?.querySelector('button') || null;
    }
    return null;
  },

  extractText(input: HTMLElement): string {
    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
      return (input as HTMLTextAreaElement).value;
    }
    return input.textContent || '';
  },

  blockSubmission(_input: HTMLElement): void {},
  restoreSubmission(_input: HTMLElement): void {},
  injectWarning(_message: string, _severity: 'warning' | 'blocked'): void {},
  removeWarning(): void {},
};

export function getAdapterForSite(): SiteAdapter {
  return genericAdapter;
}
