import "../global.css";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/src/api/queryClient";

import { StripeProvider } from "@stripe/stripe-react-native";

import { ToastHost } from "@/src/components/Toast";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  // All screens use light-only tokens (src/theme/tokens.ts). Pin the app to
  // light mode so a system dark scheme doesn't produce an illegible mix of a
  // dark nav theme + light screens.
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="dark" />
          <ToastHost />
        </ThemeProvider>
      </QueryClientProvider>
    </StripeProvider>
  );
}
