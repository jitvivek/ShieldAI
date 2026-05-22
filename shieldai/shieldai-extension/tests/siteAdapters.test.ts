import { describe, it, expect } from 'vitest';

describe('Site Adapters', () => {
  describe('ChatGPT adapter', () => {
    it('has correct match URLs', async () => {
      const { chatgptAdapter } = await import('../src/content/siteAdapters/chatgpt');
      expect(chatgptAdapter.matchUrls).toContain('chatgpt.com');
      expect(chatgptAdapter.matchUrls).toContain('chat.openai.com');
    });

    it('has the correct name', async () => {
      const { chatgptAdapter } = await import('../src/content/siteAdapters/chatgpt');
      expect(chatgptAdapter.name).toBe('ChatGPT');
    });
  });

  describe('Gemini adapter', () => {
    it('has correct match URLs', async () => {
      const { geminiAdapter } = await import('../src/content/siteAdapters/gemini');
      expect(geminiAdapter.matchUrls).toContain('gemini.google.com');
    });
  });

  describe('Claude adapter', () => {
    it('has correct match URLs', async () => {
      const { claudeAdapter } = await import('../src/content/siteAdapters/claude');
      expect(claudeAdapter.matchUrls).toContain('claude.ai');
    });
  });

  describe('Copilot adapter', () => {
    it('has correct match URLs', async () => {
      const { copilotAdapter } = await import('../src/content/siteAdapters/copilot');
      expect(copilotAdapter.matchUrls).toContain('copilot.microsoft.com');
    });
  });

  describe('Perplexity adapter', () => {
    it('has correct match URLs', async () => {
      const { perplexityAdapter } = await import('../src/content/siteAdapters/perplexity');
      expect(perplexityAdapter.matchUrls).toContain('perplexity.ai');
    });
  });

  describe('HuggingFace adapter', () => {
    it('has correct match URLs', async () => {
      const { huggingfaceAdapter } = await import('../src/content/siteAdapters/huggingface');
      expect(huggingfaceAdapter.matchUrls).toContain('huggingface.co/chat');
    });
  });
});
