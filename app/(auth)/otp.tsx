import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

export default function OtpScreen() {
  const { phone, purpose } = useLocalSearchParams<{
    phone: string;
    purpose: "SIGNUP" | "LOGIN_NEW_DEVICE";
  }>();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleVerify() {
    setError("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }

    router.replace({
      pathname: "/set-pin" as any,
      params: { phone, purpose, otpCode: otp },
    });
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-primary"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <View className="mb-10">
          <Text className="text-white text-2xl font-semibold">
            Verify your number
          </Text>
          <Text className="text-gray-400 text-base mt-2">
            Enter the 6-digit code sent to{"\n"}
            <Text className="text-white font-medium">{phone}</Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View className="mb-4">
          <TextInput
            ref={inputRef}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white text-2xl text-center tracking-widest"
            placeholder="------"
            placeholderTextColor="#374151"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(text) => {
              setError("");
              setOtp(text);
            }}
          />
          {error ? (
            <Text className="text-red-400 text-sm mt-2 text-center">
              {error}
            </Text>
          ) : null}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          className="rounded-xl py-4 items-center mt-2 bg-accent"
          onPress={handleVerify}
        >
          <Text className="text-white text-base font-semibold">Verify</Text>
        </TouchableOpacity>

        {/* Back */}
        <TouchableOpacity
          className="mt-4 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-gray-400 text-sm">← Wrong number? Go back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}