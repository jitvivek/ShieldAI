import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock chrome APIs
const mockSendMessage = vi.fn();
vi.stubGlobal('chrome', {
  runtime: { sendMessage: mockSendMessage },
  storage: {
    sync: { get: vi.fn((_keys, cb) => cb({})) },
    local: { get: vi.fn((_keys, cb) => cb({})) },
  },
});

describe('Interceptor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    mockSendMessage.mockReset();
  });

  it('extracts text from textarea', () => {
    const textarea = document.createElement('textarea');
    textarea.value = 'test message';
    document.body.appendChild(textarea);
    expect(textarea.value).toBe('test message');
  });

  it('extracts text from contenteditable', () => {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    div.textContent = 'editable content';
    document.body.appendChild(div);
    expect(div.textContent).toBe('editable content');
  });

  it('sends scan request to background', async () => {
    mockSendMessage.mockResolvedValue({
      verdict: 'safe',
      riskScore: 0,
      category: 'none',
      language: 'English',
      piiDetected: [],
      details: '',
      offline: false,
    });

    await chrome.runtime.sendMessage({
      type: 'SCAN_PROMPT',
      text: 'Hello world',
      site: 'ChatGPT',
      url: 'https://chatgpt.com',
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'SCAN_PROMPT',
      text: 'Hello world',
      site: 'ChatGPT',
      url: 'https://chatgpt.com',
    });
  });
});
