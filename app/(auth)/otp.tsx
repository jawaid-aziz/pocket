import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVerifyOtp } from "@/src/api/hooks/useAuth";
import { Button } from "@/src/components/Button";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

export default function OtpScreen() {
  const insets = useSafeAreaInsets();
  const { phone, purpose } = useLocalSearchParams<{
    phone: string;
    purpose: "SIGNUP" | "LOGIN_NEW_DEVICE";
  }>();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<TextInput>(null);
  const verifyOtp = useVerifyOtp();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleVerify() {
    setError("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }

    verifyOtp.mutate(
      { phone, otpCode: otp, purpose },
      {
        onSuccess: (data) => {
          router.replace({
            pathname: "/set-pin" as any,
            params: { phone, purpose, otpToken: data.otpToken },
          });
        },
        onError: (err: any) => setError(err.message || "Invalid OTP"),
      },
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: spacing(6) }}>
        <View style={{ marginBottom: spacing(10) }}>
          <Text style={{ ...typography.h1, fontSize: 22 }}>Verify your number</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, lineHeight: 20 }}>
            Enter the 6-digit code sent to{"\n"}
            <Text style={{ color: colors.textPrimary, fontWeight: "700" }}>{phone}</Text>
          </Text>
        </View>

        <View style={{ marginBottom: spacing(4) }}>
          <TextInput
            ref={inputRef}
            style={{
              backgroundColor: colors.surfaceAlt,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.sm + 2,
              paddingHorizontal: spacing(4),
              paddingVertical: spacing(4),
              fontSize: 26,
              color: colors.textPrimary,
              textAlign: "center",
              letterSpacing: 8,
            }}
            placeholder="------"
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(text) => {
              setError("");
              setOtp(text);
            }}
          />
          {error ? (
            <Text style={{ color: colors.danger, fontSize: 12, marginTop: 8, textAlign: "center" }}>
              {error}
            </Text>
          ) : null}
        </View>

        <Button label="Verify" onPress={handleVerify} loading={verifyOtp.isPending} />

        <Pressable
          onPress={() => router.back()}
          disabled={verifyOtp.isPending}
          style={{ marginTop: spacing(4), alignItems: "center" }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>← Wrong number? Go back</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}