import * as SecureStore from 'expo-secure-store';
import { hashSha256 } from '@/utils/crypto';

const PIN_KEY = 'shieldai_parent_pin';

class PinManager {
  async savePin(pin: string): Promise<void> {
    const hash = hashSha256(pin);
    await SecureStore.setItemAsync(PIN_KEY, hash);
  }

  async verifyPin(pin: string): Promise<boolean> {
    const stored = await SecureStore.getItemAsync(PIN_KEY);
    if (!stored) return false;
    const hash = hashSha256(pin);
    return hash === stored;
  }

  async hasPin(): Promise<boolean> {
    const stored = await SecureStore.getItemAsync(PIN_KEY);
    return stored !== null;
  }

  async deletePin(): Promise<void> {
    await SecureStore.deleteItemAsync(PIN_KEY);
  }
}

export const pinManager = new PinManager();
