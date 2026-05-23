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
      // Check if extension context is still valid
      if (!chrome.runtime?.id) {
        console.warn('[ShieldAI] Extension context invalidated — please refresh the page');
        return 'allow';
      }
      const resp = await chrome.runtime.sendMessage(request);
      if (!resp || !resp.verdict) {
        console.warn('[ShieldAI] Empty response from background, allowing message');
        return 'allow';
      }
      response = resp;
    } catch (msgErr) {
      console.warn('[ShieldAI] Message send failed (refresh page if extension was updated):', msgErr);
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

  let allowNext = false; // Flag to allow the next submission through

  // Attach to DOCUMENT in capture phase — fires BEFORE React/ChatGPT handlers
  document.addEventListener('keydown', async (e: KeyboardEvent) => {
    // Only intercept if the event target is inside our tracked input
    const target = e.target as Node;
    if (target !== input && !input.contains(target)) return;
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;

    // If we already scanned and allowed, let it through
    if (allowNext) {
      console.log('[ShieldAI] Allowing Enter through (already scanned)');
      allowNext = false;
      return;
    }

    const text = adapter.extractText(input);
    if (!text.trim()) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    console.log('[ShieldAI] Intercepted Enter. Scanning:', text.slice(0, 80));
    const result = await scanAndHandle(text);
    console.log('[ShieldAI] Scan result:', result);

    if (result === 'allow') {
      // Find and click the send button
      const btn = adapter.getSubmitButton();
      console.log('[ShieldAI] Submit button found:', !!btn, btn?.tagName, btn?.getAttribute('data-testid'));
      if (btn) {
        allowNext = true;
        btn.click();
      } else {
        // Last resort: dispatch Enter and hope it works
        allowNext = true;
        input.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
          bubbles: true, cancelable: true,
        }));
      }
    }
  }, true); // capture phase

  // Also intercept submit button clicks (user clicking with mouse)
  document.addEventListener('click', async (e: MouseEvent) => {
    const btn = adapter.getSubmitButton();
    if (!btn) return;

    // Check if the click target is the submit button or inside it
    const target = e.target as Node;
    if (target !== btn && !btn.contains(target)) return;

    // If flagged to allow, let it through
    if (allowNext) {
      allowNext = false;
      return;
    }

    const text = adapter.extractText(input);
    if (!text.trim()) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    console.log('[ShieldAI] Intercepted send button click. Scanning:', text.slice(0, 80));
    const result = await scanAndHandle(text);
    console.log('[ShieldAI] Scan result (button):', result);

    if (result === 'allow') {
      allowNext = true;
      btn.click();
    }
  }, true); // capture phase

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
