import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { getRefreshToken } from '@/src/utils/secureStorage';

export default function SplashScreen() {
  useEffect(() => {
    async function checkSession() {
      const token = await getRefreshToken();
      if (token) {
        router.replace({
          pathname: '/pin' as any,
          params: { refreshToken: token },
        });
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