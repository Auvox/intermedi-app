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
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </UserProvider>
      </RegisterProvider>
    </ThemeProvider>
  );
}
