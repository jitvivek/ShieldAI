import * as SecureStore from 'expo-secure-store';
import { firebaseAuth } from './firebaseAuth';

const TOKEN_KEY = 'shieldai_auth_token';
const REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes

class SessionManager {
  private refreshTimer: NodeJS.Timeout | null = null;

  async getToken(): Promise<string | null> {
    return firebaseAuth.getIdToken();
  }

  async persistToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  startAutoRefresh(): void {
    this.refreshTimer = setInterval(async () => {
      const token = await firebaseAuth.getIdToken();
      if (token) await this.persistToken(token);
    }, REFRESH_INTERVAL);
  }

  stopAutoRefresh(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = null;
  }

  async clearSession(): Promise<void> {
    this.stopAutoRefresh();
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await firebaseAuth.signOut();
  }
}

export const sessionManager = new SessionManager();
