import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useRequestOtp } from "@/src/api/hooks/useAuth";

function toE164(phone: string): string {
  // Strip spaces, dashes, brackets
  const digits = phone.replace(/\D/g, "");
  // 03XXXXXXXXX → +923XXXXXXXXX
  if (digits.startsWith("0") && digits.length === 11) {
    return "+92" + digits.slice(1);
  }
  return "+" + digits; // fallback, already formatted
}

function isValidPakistaniNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return /^0[3][0-9]{9}$/.test(digits);
}

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const requestOtp = useRequestOtp();

  async function handleContinue() {
    setError("");

    if (!isValidPakistaniNumber(phone)) {
      setError("Enter a valid Pakistani number (03XX-XXXXXXX)");
      return;
    }

    const e164 = toE164(phone);

    requestOtp.mutate(
      { phone: e164, purpose: "SIGNUP" },
      {
        onSuccess: () => {
          router.push({
            pathname: "/otp" as any,
            params: { phone: e164, purpose: "SIGNUP" },
          });
        },
        onError: (err: any) => {
          // 409 = phone already registered → redirect to login flow
          if (err.status === 409) {
            requestOtp.mutate(
              { phone: e164, purpose: "LOGIN_NEW_DEVICE" },
              {
                onSuccess: () => {
                  router.push({
                    pathname: "/otp" as any,
                    params: { phone: e164, purpose: "LOGIN_NEW_DEVICE" },
                  });
                },
                onError: (e: any) =>
                  setError(e.message || "Failed to send OTP"),
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
      className="flex-1 bg-primary"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <View className="mb-10">
          <Text className="text-accent text-4xl font-bold mb-2">Pocket</Text>
          <Text className="text-white text-2xl font-semibold">Welcome</Text>
          <Text className="text-gray-400 text-base mt-1">
            Enter your phone number to continue
          </Text>
        </View>

        {/* Phone Input */}
        <View className="mb-4">
          <Text className="text-gray-400 text-sm mb-2">Phone Number</Text>
          <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3 border border-white/20">
            <Text className="text-white text-base mr-2">🇵🇰</Text>
            <TextInput
              className="flex-1 text-white text-base"
              placeholder="03XX-XXXXXXX"
              placeholderTextColor="#6B7280"
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
            <Text className="text-red-400 text-sm mt-2">{error}</Text>
          ) : null}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center mt-2 ${
            requestOtp.isPending ? "bg-accent/50" : "bg-accent"
          }`}
          onPress={handleContinue}
          disabled={requestOtp.isPending}
        >
          {requestOtp.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-semibold">Continue</Text>
          )}
        </TouchableOpacity>

        {/* Footer note */}
        <Text className="text-gray-500 text-xs text-center mt-6">
          New users will be registered automatically.{"\n"}
          Existing users will receive a login code.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
