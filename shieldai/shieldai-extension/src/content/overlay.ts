import type { PiiMatch } from '../shared/types';
import { OVERLAY_AUTO_DISMISS_MS } from '../shared/constants';

interface OverlayOptions {
  severity: 'warning' | 'blocked';
  category: string;
  language: string;
  details: string;
  pii: PiiMatch[];
  onSendAnyway?: () => void;
  onEdit?: () => void;
}

let overlayHost: HTMLElement | null = null;
let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;

export function showOverlay(options: OverlayOptions): void {
  removeOverlay();

  // Create Shadow DOM host to isolate styles
  overlayHost = document.createElement('div');
  overlayHost.id = 'shieldai-overlay-host';
  overlayHost.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:2147483647;';
  document.body.appendChild(overlayHost);

  const shadow = overlayHost.attachShadow({ mode: 'closed' });

  const isBlocked = options.severity === 'blocked';
  const bgColor = isBlocked ? '#FEE2E2' : '#FEF3C7';
  const borderColor = isBlocked ? '#EF4444' : '#F59E0B';
  const iconEmoji = isBlocked ? '🛡️' : '⚠️';
  const title = isBlocked
    ? 'ShieldAI blocked this message for your safety'
    : 'ShieldAI detected a potential risk in your message';

  const detailText = options.pii.length > 0
    ? `PII detected: ${options.pii.map(p => `${p.label} (${p.masked})`).join(', ')}`
    : `Category: ${options.category.replace(/_/g, ' ')} | Language: ${options.language}`;

  const buttonsHtml = isBlocked
    ? `<button id="shieldai-edit" style="padding:8px 16px;border-radius:6px;border:1px solid #6B7280;background:#fff;cursor:pointer;font-size:13px;">Edit message</button>`
    : `<button id="shieldai-send" style="padding:8px 16px;border-radius:6px;border:none;background:#F59E0B;color:#fff;cursor:pointer;font-size:13px;margin-right:8px;">Send anyway</button>
       <button id="shieldai-edit" style="padding:8px 16px;border-radius:6px;border:1px solid #6B7280;background:#fff;cursor:pointer;font-size:13px;">Edit message</button>`;

  const html = `
    <style>
      .shieldai-overlay {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        background: ${bgColor};
        border: 1px solid ${borderColor};
        border-radius: 12px;
        padding: 16px 20px;
        max-width: 480px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        animation: shieldai-slide-up 0.3s ease-out;
      }
      .shieldai-title { font-size: 14px; font-weight: 600; color: #1F2937; margin-bottom: 6px; }
      .shieldai-detail { font-size: 12px; color: #6B7280; margin-bottom: 12px; }
      .shieldai-actions { display: flex; justify-content: flex-end; }
      @keyframes shieldai-slide-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
    <div class="shieldai-overlay">
      <div class="shieldai-title">${iconEmoji} ${title}</div>
      <div class="shieldai-detail">${detailText}</div>
      <div class="shieldai-actions">${buttonsHtml}</div>
    </div>
  `;

  shadow.innerHTML = html;

  // Attach event listeners
  const editBtn = shadow.getElementById('shieldai-edit');
  if (editBtn && options.onEdit) {
    editBtn.addEventListener('click', options.onEdit);
  }

  const sendBtn = shadow.getElementById('shieldai-send');
  if (sendBtn && options.onSendAnyway) {
    sendBtn.addEventListener('click', options.onSendAnyway);
  }

  // Auto-dismiss warning overlays
  if (!isBlocked) {
    autoDismissTimer = setTimeout(() => {
      if (options.onSendAnyway) options.onSendAnyway();
    }, OVERLAY_AUTO_DISMISS_MS);
  }
}

export function removeOverlay(): void {
  if (autoDismissTimer) {
    clearTimeout(autoDismissTimer);
    autoDismissTimer = null;
  }
  if (overlayHost) {
    overlayHost.remove();
    overlayHost = null;
  }
}
