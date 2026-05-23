import PostHog from 'posthog-react-native';
import { CONFIG } from '@/constants/config';

class PosthogTracker {
  private client: any = null;

  async initialize(): Promise<void> {
    this.client = new PostHog(CONFIG.POSTHOG_API_KEY, {
      host: CONFIG.POSTHOG_HOST,
    });
  }

  track(event: string, properties?: Record<string, any>): void {
    this.client?.capture(event, properties);
  }

  identify(userId: string, traits?: Record<string, any>): void {
    this.client?.identify(userId, traits);
  }

  screen(name: string): void {
    this.client?.screen(name);
  }

  reset(): void {
    this.client?.reset();
  }
}

export const posthogTracker = new PosthogTracker();
