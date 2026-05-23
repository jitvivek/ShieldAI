import { useEffect, useState } from 'react';
import { accessibilityBridge } from '@/services/monitoring/accessibilityBridge';
import { Platform } from 'react-native';

export function useShieldStatus() {
  const [status, setStatus] = useState<'active' | 'warning' | 'offline'>('active');

  useEffect(() => {
    const checkStatus = async () => {
      if (Platform.OS === 'android') {
        const enabled = await accessibilityBridge.isServiceEnabled();
        setStatus(enabled ? 'active' : 'warning');
      } else {
        setStatus('active');
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return { status };
}
