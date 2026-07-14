import { useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PinPad from "@/src/components/PinPad";
import PinDots from "@/src/components/PinDots";
import { usePinUnlock } from "@/src/api/hooks/useAuth";
import { clearRefreshToken } from "@/src/utils/secureStorage";
import { colors, spacing, typography } from "@/src/theme/tokens";

const PIN_LENGTH = 6;

export default function PinScreen() {
  const insets = useSafeAreaInsets();
  const { refreshToken } = useLocalSearchParams<{ refreshToken: string }>();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const pinUnlock = usePinUnlock();

  function handleDigit(digit: string) {
    if (pin.length >= PIN_LENGTH || pinUnlock.isPending) return;
    const next = pin + digit;
    setPin(next);
    setError("");

    if (next.length === PIN_LENGTH) {
      pinUnlock.mutate(
        { refreshToken, pin: next },
        {
          onSuccess: () => router.replace("/(tabs)" as any),
          onError: async (err: any) => {
            setPin("");
            if (err.status === 401 && err.message?.includes("Device not recognized")) {
              await clearRefreshToken();
              router.replace("/login" as any);
            } else {
              setError(err.message || "Incorrect PIN");
            }
          },
        },
      );
    }
  }

  function handleDelete() {
    if (pinUnlock.isPending) return;
    setError("");
    setPin(pin.slice(0, -1));
  }

  async function handleSignOut() {
    await clearRefreshToken();
    router.replace("/login" as any);
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing(6),
        paddingTop: insets.top,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: spacing(2) }}>
        <Text style={{ color: colors.primary, fontSize: 28, fontWeight: "800", marginBottom: 4 }}>
          Pocket
        </Text>
        <Text style={{ ...typography.h1, fontSize: 19 }}>Enter your PIN</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
          Enter your 6-digit PIN to unlock
        </Text>
      </View>

      <PinDots length={PIN_LENGTH} filled={pin.length} error={!!error} />

      {error ? (
        <Text style={{ color: colors.danger, fontSize: 13, marginBottom: spacing(4), textAlign: "center" }}>
          {error}
        </Text>
      ) : null}

      {pinUnlock.isPending ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginBottom: spacing(4) }} />
      ) : (
        <View style={{ marginBottom: spacing(4), height: 32 }} />
      )}

      <PinPad onPress={handleDigit} onDelete={handleDelete} />

      <Pressable onPress={handleSignOut} disabled={pinUnlock.isPending} style={{ marginTop: spacing(6) }}>
        <Text style={{ color: colors.textTertiary, fontSize: 13 }}>Not you? Sign out</Text>
      </Pressable>
    </View>
  );
}