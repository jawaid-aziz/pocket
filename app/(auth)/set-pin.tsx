import { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PinPad from "@/src/components/PinPad";
import PinDots from "@/src/components/PinDots";
import { useSignup, useLoginNewDevice } from "@/src/api/hooks/useAuth";
import { colors, spacing, typography } from "@/src/theme/tokens";

const PIN_LENGTH = 6;

type Step = "enter" | "confirm";

export default function SetPinScreen() {
  const insets = useSafeAreaInsets();
  const { phone, purpose, email, otpToken } = useLocalSearchParams<{
    phone: string;
    purpose: "SIGNUP" | "LOGIN_NEW_DEVICE";
    email: string;
    otpToken: string;
  }>();

  const [step, setStep] = useState<Step>("enter");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const signup = useSignup();
  const loginNewDevice = useLoginNewDevice();
  const isPending = signup.isPending || loginNewDevice.isPending;

  const currentPin = step === "enter" ? pin : confirmPin;
  const setCurrentPin = step === "enter" ? setPin : setConfirmPin;

  function handleDigit(digit: string) {
    if (currentPin.length >= PIN_LENGTH) return;
    const next = currentPin + digit;
    setCurrentPin(next);
    setError("");

    if (next.length === PIN_LENGTH) {
      if (step === "enter") {
        setTimeout(() => setStep("confirm"), 200);
      } else {
        if (pin !== next) {
          setError("PINs don't match. Try again.");
          setConfirmPin("");
          setStep("enter");
          setPin("");
          return;
        }
        submitWithPin(next);
      }
    }
  }

  function handleDelete() {
    setError("");
    setCurrentPin(currentPin.slice(0, -1));
  }

  function submitWithPin(finalPin: string) {
    if (purpose === "SIGNUP") {
      signup.mutate(
        { phone, email, otpToken, pin: finalPin },
        {
          onSuccess: () => router.replace("/(tabs)" as any),
          onError: (err: any) => {
            setError(err.message || "Something went wrong");
            setPin("");
            setConfirmPin("");
            setStep("enter");
          },
        },
      );
    } else {
      loginNewDevice.mutate(
        { phone, otpToken, pin: finalPin },
        {
          onSuccess: () => router.replace("/(tabs)" as any),
          onError: (err: any) => {
            setError(err.message || "Something went wrong");
            setPin("");
            setConfirmPin("");
            setStep("enter");
          },
        },
      );
    }
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
        <Text style={typography.h1}>
          {step === "enter" ? "Set your PIN" : "Confirm your PIN"}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8, textAlign: "center" }}>
          {step === "enter"
            ? "Choose a 6-digit PIN to secure your wallet"
            : "Enter the same PIN again to confirm"}
        </Text>
      </View>

      <PinDots length={PIN_LENGTH} filled={currentPin.length} error={!!error} />

      {error ? (
        <Text style={{ color: colors.danger, fontSize: 13, marginBottom: spacing(4), textAlign: "center" }}>
          {error}
        </Text>
      ) : null}

      {isPending ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginBottom: spacing(4) }} />
      ) : (
        <View style={{ marginBottom: spacing(4), height: 32 }} />
      )}

      <PinPad onPress={handleDigit} onDelete={handleDelete} />
    </View>
  );
}