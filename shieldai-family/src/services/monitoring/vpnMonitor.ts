import { Platform } from 'react-native';

class VpnMonitor {
  private isActive = false;

  async start(): Promise<void> {
    if (Platform.OS !== 'ios') return;
    // iOS Network Extension based content filter.
    // Monitors outgoing traffic to AI domains via local VPN.
    // Actual implementation requires NEFilterDataProvider in Swift.
    this.isActive = true;
  }

  async stop(): Promise<void> {
    this.isActive = false;
  }

  getStatus(): boolean {
    return this.isActive;
  }
}

export const vpnMonitor = new VpnMonitor();
