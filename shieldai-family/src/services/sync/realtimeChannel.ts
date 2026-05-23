import { CONFIG } from '@/constants/config';

type MessageHandler = (data: any) => void;

class RealtimeChannel {
  private ws: WebSocket | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;

  connect(token: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`${CONFIG.BACKEND_WS_URL}?token=${token}`);

    this.ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        const typeHandlers = this.handlers.get(type);
        typeHandlers?.forEach((handler) => handler(data));
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this.reconnectTimer = setTimeout(() => this.connect(token), 5000);
    };
  }

  on(type: string, handler: MessageHandler): () => void {
    const existing = this.handlers.get(type) ?? [];
    existing.push(handler);
    this.handlers.set(type, existing);

    return () => {
      const handlers = this.handlers.get(type) ?? [];
      this.handlers.set(type, handlers.filter((h) => h !== handler));
    };
  }

  send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

export const realtimeChannel = new RealtimeChannel();
