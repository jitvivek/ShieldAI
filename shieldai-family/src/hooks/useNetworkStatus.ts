import { useEffect, useState } from 'react';
import { NetInfo } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simplified - in production use @react-native-community/netinfo
    setIsOnline(true);
  }, []);

  return { isOnline };
}
