import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { router } from "expo-router";
import { getRefreshToken } from "@/src/utils/secureStorage";
import { colors } from "@/src/theme/tokens";
import { StatusBar } from "expo-status-bar";

export default function SplashScreen() {
  useEffect(() => {
    async function checkSession() {
      const token = await getRefreshToken();
      if (token) {
        router.replace({
          pathname: "/pin" as any,
          params: { refreshToken: token },
        });
      } else {
        router.replace("/login" as any);
      }
    }
    checkSession();
  }, []);

return (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.primaryDark }}>
    <StatusBar style="light" />
    <Text style={{ color: colors.onPrimary, fontSize: 32, fontWeight: "800", marginBottom: 16 }}>
      Pocket
    </Text>
    <ActivityIndicator size="large" color={colors.onPrimarySoft} />
  </View>
);
}