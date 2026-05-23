import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'scan-queue' });
const QUEUE_KEY = 'pendingScans';

interface QueuedScan {
  id: string;
  text: string;
  packageName: string;
  appName: string;
  eventType: string;
  timestamp: number;
  queuedAt: number;
}

class ScanQueue {
  enqueue(event: { text: string; packageName: string; appName: string; eventType: string; timestamp: number }): void {
    const queue = this.getQueue();
    const item: QueuedScan = {
      id: `${event.timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      ...event,
      queuedAt: Date.now(),
    };
    queue.push(item);
    // Keep max 100 items in queue
    const trimmed = queue.slice(-100);
    storage.set(QUEUE_KEY, JSON.stringify(trimmed));
  }

  getQueue(): QueuedScan[] {
    const raw = storage.getString(QUEUE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  dequeue(count: number = 10): QueuedScan[] {
    const queue = this.getQueue();
    const items = queue.slice(0, count);
    const remaining = queue.slice(count);
    storage.set(QUEUE_KEY, JSON.stringify(remaining));
    return items;
  }

  clear(): void {
    storage.delete(QUEUE_KEY);
  }

  get size(): number {
    return this.getQueue().length;
  }
}

export const scanQueue = new ScanQueue();
