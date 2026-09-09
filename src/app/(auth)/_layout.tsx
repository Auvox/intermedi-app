import { Stack } from "expo-router";

import { ThemeProvider } from "@/context/theme-context";

export default function AuthLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="register/cadastro" />
        <Stack.Screen name="register/endereco" />
        <Stack.Screen name="register/login" />
      </Stack>
    </ThemeProvider>
  );
}
