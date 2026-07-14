import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRequestOtp } from "@/src/api/hooks/useAuth";
import { Button } from "@/src/components/Button";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    return "+92" + digits.slice(1);
  }
  return "+" + digits;
}

function isValidPakistaniNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return /^0[3][0-9]{9}$/.test(digits);
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const requestOtp = useRequestOtp();

  function goToOtp(e164: string, purpose: "SIGNUP" | "LOGIN_NEW_DEVICE") {
    router.push({ pathname: "/otp" as any, params: { phone: e164, purpose } });
  }

  function handleContinue() {
    setError("");

    if (!isValidPakistaniNumber(phone)) {
      setError("Enter a valid Pakistani number (03XX-XXXXXXX)");
      return;
    }

    const e164 = toE164(phone);

    requestOtp.mutate(
      { phone: e164, purpose: "SIGNUP" },
      {
        onSuccess: () => goToOtp(e164, "SIGNUP"),
        onError: (err: any) => {
          if (err.status === 409) {
            requestOtp.mutate(
              { phone: e164, purpose: "LOGIN_NEW_DEVICE" },
              {
                onSuccess: () => goToOtp(e164, "LOGIN_NEW_DEVICE"),
                onError: (e: any) => setError(e.message || "Failed to send OTP"),
              },
            );
          } else {
            setError(err.message || "Failed to send OTP");
          }
        },
      },
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: spacing(6) }}>
        {/* Header */}
        <View style={{ marginBottom: spacing(10) }}>
          <Text style={{ color: colors.primary, fontSize: 34, fontWeight: "800", marginBottom: 6 }}>
            Pocket
          </Text>
          <Text style={{ ...typography.h1, fontSize: 22 }}>Welcome</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>
            Enter your phone number to continue
          </Text>
        </View>

        {/* Phone input */}
        <View style={{ marginBottom: spacing(4) }}>
          <Text style={{ ...typography.caption, marginBottom: 8 }}>Phone Number</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.sm + 2,
              paddingHorizontal: spacing(4),
              paddingVertical: spacing(3),
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 15, marginRight: 8 }}>🇵🇰</Text>
            <TextInput
              style={{ flex: 1, fontSize: 15, color: colors.textPrimary }}
              placeholder="03XX-XXXXXXX"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => {
                setError("");
                setPhone(text);
              }}
              maxLength={13}
              autoFocus
            />
          </View>
          {error ? (
            <Text style={{ color: colors.danger, fontSize: 12, marginTop: 8 }}>{error}</Text>
          ) : null}
        </View>

        <Button
          label="Continue"
          onPress={handleContinue}
          loading={requestOtp.isPending}
        />

        <Text
          style={{
            color: colors.textTertiary,
            fontSize: 11,
            textAlign: "center",
            marginTop: spacing(6),
            lineHeight: 16,
          }}
        >
          New users will be registered automatically.{"\n"}
          Existing users will receive a login code.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}