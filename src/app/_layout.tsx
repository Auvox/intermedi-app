import { Stack } from "expo-router";

import { RegisterProvider } from "@/components/auth/context-login";
import { ThemeProvider } from "@/context/theme-context";
import { UserProvider } from "@/context/user-context";

import { FavoritesProvider } from "@/context/favorites-context";

export default function AuthLayout() {
  return (
    <ThemeProvider>
      <RegisterProvider>
        <UserProvider>
          <FavoritesProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </FavoritesProvider>
        </UserProvider>
      </RegisterProvider>
    </ThemeProvider>
  );
}
