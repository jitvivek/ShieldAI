import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function Index() {
  const { isAuthenticated, isLoading, userMode } = useAuthStore();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;

  if (userMode === 'child') return <Redirect href="/(child)/status" />;

  return <Redirect href="/(parent)/dashboard" />;
}
