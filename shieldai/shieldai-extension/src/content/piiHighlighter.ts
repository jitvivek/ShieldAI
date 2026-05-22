import type { PiiMatch } from '../shared/types';

let tooltipEl: HTMLElement | null = null;

export function highlightPii(input: HTMLElement, matches: PiiMatch[]): void {
  clearPiiHighlights();

  if (matches.length === 0) return;

  // Show a tooltip near the input element
  tooltipEl = document.createElement('div');
  tooltipEl.id = 'shieldai-pii-tooltip';
  tooltipEl.style.cssText = `
    position: absolute;
    background: #FEF3C7;
    border: 1px solid #F59E0B;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 12px;
    color: #92400E;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    z-index: 2147483646;
    pointer-events: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  `;

  const labels = [...new Set(matches.map(m => m.label))];
  tooltipEl.textContent = `⚠️ ${labels.join(', ')} detected — this will be blocked`;

  // Position near the input
  const rect = input.getBoundingClientRect();
  tooltipEl.style.top = `${rect.top + window.scrollY - 32}px`;
  tooltipEl.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(tooltipEl);
}

export function clearPiiHighlights(): void {
  if (tooltipEl) {
    tooltipEl.remove();
    tooltipEl = null;
  }
}
