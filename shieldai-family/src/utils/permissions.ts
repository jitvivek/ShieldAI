import { Platform, Linking, NativeModules } from 'react-native';

export const permissions = {
  async checkAccessibilityService(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    const { ShieldModule } = NativeModules;
    if (!ShieldModule?.isAccessibilityEnabled) return false;
    return ShieldModule.isAccessibilityEnabled();
  },

  async requestOverlayPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    const { ShieldModule } = NativeModules;
    if (ShieldModule?.requestOverlayPermission) {
      return ShieldModule.requestOverlayPermission();
    }
    await Linking.openSettings();
    return false;
  },

  async checkOverlayPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    const { ShieldModule } = NativeModules;
    if (!ShieldModule?.hasOverlayPermission) return false;
    return ShieldModule.hasOverlayPermission();
  },
};
