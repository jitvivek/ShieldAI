import type { ScanRequest, ScanResponse } from '../shared/types';
import { PII_SCAN_DEBOUNCE_MS } from '../shared/constants';
import { getAdapterForSite } from './siteAdapters/generic';
import { chatgptAdapter } from './siteAdapters/chatgpt';
import { geminiAdapter } from './siteAdapters/gemini';
import { claudeAdapter } from './siteAdapters/claude';
import { copilotAdapter } from './siteAdapters/copilot';
import { perplexityAdapter } from './siteAdapters/perplexity';
import { huggingfaceAdapter } from './siteAdapters/huggingface';
import { showOverlay, removeOverlay } from './overlay';
import { highlightPii, clearPiiHighlights } from './piiHighlighter';
import { scanForPii } from '../shared/piiPatterns';
import type { SiteAdapter } from '../shared/types';

const adapters: SiteAdapter[] = [
  chatgptAdapter,
  geminiAdapter,
  claudeAdapter,
  copilotAdapter,
  perplexityAdapter,
  huggingfaceAdapter,
];

let activeAdapter: SiteAdapter | null = null;
let isScanning = false;
let piiDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function getAdapter(): SiteAdapter {
  const url = window.location.href;
  for (const adapter of adapters) {
    if (adapter.matchUrls.some(pattern => url.includes(pattern))) {
      return adapter;
    }
  }
  return getAdapterForSite();
}

async function scanAndHandle(text: string): Promise<'allow' | 'block'> {
  if (isScanning) return 'allow';
  isScanning = true;

  try {
    const site = activeAdapter?.name || 'Unknown';
    const request: ScanRequest = {
      type: 'SCAN_PROMPT',
      text,
      site,
      url: window.location.href,
    };

    let response: ScanResponse;
    try {
      const resp = await chrome.runtime.sendMessage(request);
      if (!resp || !resp.verdict) {
        console.warn('[ShieldAI] Empty response from background, running will allow');
        return 'allow';
      }
      response = resp;
    } catch (msgErr) {
      console.warn('[ShieldAI] Message send failed:', msgErr);
      return 'allow';
    }

    if (response.verdict === 'safe') {
      removeOverlay();
      return 'allow';
    }

    if (response.verdict === 'suspicious') {
      return new Promise((resolve) => {
        showOverlay({
          severity: 'warning',
          category: response.category,
          language: response.language,
          details: response.details,
          pii: response.piiDetected,
          onSendAnyway: () => {
            removeOverlay();
            resolve('allow');
          },
          onEdit: () => {
            removeOverlay();
            resolve('block');
          },
        });
      });
    }

    // malicious → block
    showOverlay({
      severity: 'blocked',
      category: response.category,
      language: response.language,
      details: response.details,
      pii: response.piiDetected,
      onEdit: () => removeOverlay(),
    });
    return 'block';
  } catch (e) {
    console.warn('[ShieldAI] Scan error:', e);
    return 'allow'; // Fail open — don't break the page
  } finally {
    isScanning = false;
  }
}

function interceptSubmission(adapter: SiteAdapter): void {
  const input = adapter.getInputElement();
  if (!input) return;

  // Intercept Enter key
  input.addEventListener('keydown', async (e: Event) => {
    const keyEvent = e as KeyboardEvent;
    if (keyEvent.key === 'Enter' && !keyEvent.shiftKey) {
      const text = adapter.extractText(input);
      if (!text.trim()) return;

      keyEvent.preventDefault();
      keyEvent.stopPropagation();

      const result = await scanAndHandle(text);
      if (result === 'allow') {
        // Re-dispatch the event to let the page handle it
        adapter.restoreSubmission(input);
        input.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
        }));
      }
    }
  }, true);

  // Intercept submit button click
  const submitBtn = adapter.getSubmitButton();
  if (submitBtn) {
    submitBtn.addEventListener('click', async (e: Event) => {
      const text = adapter.extractText(input);
      if (!text.trim()) return;

      e.preventDefault();
      e.stopPropagation();

      const result = await scanAndHandle(text);
      if (result === 'allow') {
        adapter.restoreSubmission(input);
        submitBtn.click();
      }
    }, true);
  }

  // PII highlighting on input (debounced) — listen to both input and keyup for contenteditable
  const piiHandler = () => {
    if (piiDebounceTimer) clearTimeout(piiDebounceTimer);
    piiDebounceTimer = setTimeout(() => {
      try {
        const text = adapter.extractText(input);
        const piiMatches = scanForPii(text);
        if (piiMatches.length > 0) {
          highlightPii(input, piiMatches);
        } else {
          clearPiiHighlights();
        }
      } catch {
        // Never break the page
      }
    }, PII_SCAN_DEBOUNCE_MS);
  };
  input.addEventListener('input', piiHandler);
  input.addEventListener('keyup', piiHandler);
}

export function initInterceptor(): void {
  activeAdapter = getAdapter();
  let attachedTo: HTMLElement | null = null;

  const tryAttach = () => {
    try {
      const input = activeAdapter!.getInputElement();
      if (input && input !== attachedTo) {
        interceptSubmission(activeAdapter!);
        attachedTo = input;
        console.log('[ShieldAI] Interceptor attached to', activeAdapter!.name, 'input');
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  };

  // Try immediately
  tryAttach();

  // Continuously watch for DOM changes (ChatGPT dynamically replaces elements)
  const observer = new MutationObserver(() => {
    const input = activeAdapter!.getInputElement();
    // Re-attach if the element changed or was recreated
    if (input && input !== attachedTo) {
      tryAttach();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
