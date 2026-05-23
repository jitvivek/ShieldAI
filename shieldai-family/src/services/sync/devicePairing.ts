import { CONFIG } from '@/constants/config';

class DevicePairing {
  generatePairingCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SF-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  listenForPairing(code: string, onPaired: () => void): () => void {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${CONFIG.BACKEND_API_URL}/pairing/check/${code}`);
        const data = await response.json();
        if (data.paired) {
          onPaired();
          clearInterval(interval);
        }
      } catch {
        // Silently retry
      }
    }, 3000);

    return () => clearInterval(interval);
  }

  async confirmPairing(code: string, childDeviceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${CONFIG.BACKEND_API_URL}/pairing/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, deviceId: childDeviceId }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const devicePairing = new DevicePairing();
