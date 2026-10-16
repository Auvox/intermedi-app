import { Stack } from "expo-router";
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from "@expo-google-fonts/poppins";

import { RegisterProvider } from "@/components/auth/context-login";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { CareProvider } from "@/context/care-context";
import { ThemeProvider } from "@/context/theme-context";
import { UserProvider } from "@/context/user-context";

import { FavoritesProvider } from "@/context/favorites-context";

export default function AuthLayout() {
  const [fontsLoaded, fontError] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  if (!fontsLoaded && !fontError) return <LoadingScreen />;
  return (
    <ThemeProvider>
      <RegisterProvider>
        <UserProvider>
          <FavoritesProvider>
            <CareProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </CareProvider>
          </FavoritesProvider>
        </UserProvider>
      </RegisterProvider>
    </ThemeProvider>
  );
}
