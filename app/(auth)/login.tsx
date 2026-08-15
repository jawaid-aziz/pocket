import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRequestOtp } from "@/src/api/hooks/useAuth";
import { Button } from "@/src/components/Button";
import { toE164, isValidPakistaniNumber } from "@/src/utils/phone";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const requestOtp = useRequestOtp();

  function goToOtp(e164: string, purpose: "SIGNUP" | "LOGIN_NEW_DEVICE", email?: string) {
    router.push({
      pathname: "/otp" as any,
      params: { phone: e164, purpose, email: email || "" },
    });
  }

  function handleContinue() {
    setError("");

    if (!isValidPakistaniNumber(phone)) {
      setError("Enter a valid Pakistani number (03XX-XXXXXXX)");
      return;
    }

    // Email is only required for new accounts — don't block a returning user
    // who no longer remembers what they typed at signup.
    if (email && !isValidEmail(email)) {
      setError("Enter a valid email address");
      return;
    }

    const e164 = toE164(phone);

    requestOtp.mutate(
      { phone: e164, purpose: "SIGNUP", email },
      {
        onSuccess: () => goToOtp(e164, "SIGNUP", email),
        onError: (err: any) => {
          // Only fall back to login when the phone is already registered.
          // An "Email already registered" conflict is a signup problem the
          // user must resolve — never route it into the login flow.
          if (
            err.status === 409 &&
            err.message?.includes("Phone already registered")
          ) {
            requestOtp.mutate(
              { phone: e164, purpose: "LOGIN_NEW_DEVICE" },
              {
                onSuccess: () => goToOtp(e164, "LOGIN_NEW_DEVICE"),
                onError: (e: any) => setError(e.message || "Failed to send OTP"),
              },
            );
          } else if (
            err.status === 400 &&
            err.message?.includes("email is required")
          ) {
            setError("Email is required for new accounts");
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
          <Text style={typography.h1}>Welcome</Text>
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
        </View>

        {/* Email input */}
        <View style={{ marginBottom: spacing(4) }}>
          <Text style={{ ...typography.caption, marginBottom: 8 }}>Email</Text>
          <View
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.sm + 2,
              paddingHorizontal: spacing(4),
              paddingVertical: spacing(3),
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TextInput
              style={{ fontSize: 15, color: colors.textPrimary }}
              placeholder="you@example.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setError("");
                setEmail(text);
              }}
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