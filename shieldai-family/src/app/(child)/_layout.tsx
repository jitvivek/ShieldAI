import { Stack } from 'expo-router';

export default function ChildLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="status" />
      <Stack.Screen name="history" />
      <Stack.Screen name="panic" />
      <Stack.Screen name="blocked" />
      <Stack.Screen name="unlock" />
    </Stack>
  );
}
