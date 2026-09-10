import { Stack } from "expo-router";

import { RegisterProvider } from "@/components/auth/context-login";
import { ThemeProvider } from "@/context/theme-context";
import { UserProvider } from "@/context/user-context";

export default function AuthLayout() {
  return (
    <ThemeProvider>
      <RegisterProvider>
        <UserProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="register/cadastro" />
            <Stack.Screen name="register/endereco" />
            <Stack.Screen name="register/login" />
          </Stack>
        </UserProvider>
      </RegisterProvider>
    </ThemeProvider>
  );
}
