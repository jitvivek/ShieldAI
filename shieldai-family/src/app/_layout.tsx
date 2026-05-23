import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import '../styles/global.css';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit: require('@/assets/fonts/Outfit-Regular.ttf'),
    'Outfit-Bold': require('@/assets/fonts/Outfit-Bold.ttf'),
    NotoSans: require('@/assets/fonts/NotoSans-Regular.ttf'),
    'NotoSans-Bold': require('@/assets/fonts/NotoSans-Bold.ttf'),
    DMMono: require('@/assets/fonts/DMMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(parent)" />
            <Stack.Screen name="(child)" />
          </Stack>
          <StatusBar style="auto" />
        </I18nextProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
