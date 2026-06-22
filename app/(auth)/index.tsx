import { getRefreshToken } from "@/src/utils/secureStorage";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function SplashScreen() {
  useEffect(() => {
    async function checkSession() {
      const token = await getRefreshToken();
      if (token) {
        router.replace('/pin' as any);
      } else {
        router.replace('/login' as any);
      }
    }
    checkSession();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <ActivityIndicator size="large" color="#10B981" />
    </View>
  );
}
