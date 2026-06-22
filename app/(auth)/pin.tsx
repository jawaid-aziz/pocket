import { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import PinPad from '@/src/components/PinPad';
import PinDots from '@/src/components/PinDots';
import { usePinUnlock } from '@/src/api/hooks/useAuth';
import { clearRefreshToken } from '@/src/utils/secureStorage';

const PIN_LENGTH = 6;

export default function PinScreen() {
  const { refreshToken } = useLocalSearchParams<{ refreshToken: string }>();

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const pinUnlock = usePinUnlock();

  function handleDigit(digit: string) {
    if (pin.length >= PIN_LENGTH || pinUnlock.isPending) return;
    const next = pin + digit;
    setPin(next);
    setError('');

    if (next.length === PIN_LENGTH) {
      pinUnlock.mutate(
        { refreshToken, pin: next },
        {
          onSuccess: () => {
            router.replace('/(tabs)' as any);
          },
          onError: async (err: any) => {
            setPin('');
            // 401 with "Device not recognized" = token revoked → force re-login
            if (err.status === 401 && err.message?.includes('Device not recognized')) {
              await clearRefreshToken();
              router.replace('/login' as any);
            } else {
              setError(err.message || 'Incorrect PIN');
            }
          },
        }
      );
    }
  }

  function handleDelete() {
    if (pinUnlock.isPending) return;
    setError('');
    setPin(pin.slice(0, -1));
  }

  async function handleSignOut() {
    await clearRefreshToken();
    router.replace('/login' as any);
  }

  return (
    <View className="flex-1 bg-primary items-center justify-center px-6">
      {/* Header */}
      <View className="items-center mb-2">
        <Text className="text-accent text-3xl font-bold mb-1">Pocket</Text>
        <Text className="text-white text-xl font-semibold">Enter your PIN</Text>
        <Text className="text-gray-400 text-sm mt-1">
          Enter your 6-digit PIN to unlock
        </Text>
      </View>

      {/* PIN Dots */}
      <PinDots
        length={PIN_LENGTH}
        filled={pin.length}
        error={!!error}
      />

      {/* Error */}
      {error ? (
        <Text className="text-red-400 text-sm mb-4 text-center">{error}</Text>
      ) : null}

      {/* Loading */}
      {pinUnlock.isPending ? (
        <ActivityIndicator color="#10B981" size="large" className="mb-4" />
      ) : (
        <View className="mb-4 h-8" />
      )}

      {/* Pin Pad */}
      <PinPad onPress={handleDigit} onDelete={handleDelete} />

      {/* Sign out option */}
      <TouchableOpacity
        className="mt-6"
        onPress={handleSignOut}
        disabled={pinUnlock.isPending}
      >
        <Text className="text-gray-500 text-sm">
          Not you? Sign out
        </Text>
      </TouchableOpacity>
    </View>
  );
}