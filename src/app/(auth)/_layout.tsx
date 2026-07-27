import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="register/cadastro" />
      <Stack.Screen name="register/endereco" />
      <Stack.Screen name="register/login" />
    </Stack>
  );
}
