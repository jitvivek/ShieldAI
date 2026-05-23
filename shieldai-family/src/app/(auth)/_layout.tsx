import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="setup-child" />
      <Stack.Screen name="pair-device" />
      <Stack.Screen name="enable-protection" />
      <Stack.Screen name="set-pin" />
      <Stack.Screen name="setup-complete" />
    </Stack>
  );
}
