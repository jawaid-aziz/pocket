import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useSendMoney } from "@/src/api/hooks/useTransactions";
import { useWalletStore } from "@/src/store/walletStore";

export default function SendMoneyScreen() {
  const insets = useSafeAreaInsets();
  const balance = useWalletStore((s) => s.balance);
  const { mutate: send, isPending } = useSendMoney();

  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  function handleSend() {
    const parsed = Number(amount);

    if (!phone.trim()) {
      Alert.alert("Missing Info", "Please enter recipient phone number.");
      return;
    }
    if (!parsed || parsed <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    if (parsed > Number(balance)) {
      Alert.alert("Insufficient Balance", "You don't have enough funds.");
      return;
    }

    Alert.alert(
      "Confirm Transfer",
      `Send Rs. ${parsed.toLocaleString()} to ${phone}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () =>
            send(
              { recipientPhone: phone.trim(), amount: parsed, description },
              {
                onSuccess: (data) => {
                  Alert.alert(
                    "Sent!",
                    `Rs. ${parsed.toLocaleString()} sent to ${data.recipient.name || data.recipient.phone}`,
                    [{ text: "OK", onPress: () => router.back() }]
                  );
                  setPhone("");
                  setAmount("");
                  setDescription("");
                },
                onError: (err: any) => {
                  Alert.alert("Failed", err?.message || "Transfer failed.");
                },
              }
            ),
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-primary"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1" style={{ paddingTop: insets.top }}>

        {/* Header */}
        <View className="px-6 pt-4 pb-6 flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-accent text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Send Money</Text>
        </View>

        <View className="px-6 flex-1">

          {/* Balance */}
          <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
            <Text className="text-gray-400 text-sm mb-1">Available Balance</Text>
            <Text className="text-white text-3xl font-bold">
              Rs. {Number(balance).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {/* Recipient Phone */}
          <Text className="text-gray-400 text-sm mb-2">Recipient Phone Number</Text>
          <View className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mb-5">
            <TextInput
              className="text-white text-base"
              placeholder="+923001234567"
              placeholderTextColor="#4B5563"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              autoCorrect={false}
            />
          </View>

          {/* Amount */}
          <Text className="text-gray-400 text-sm mb-2">Amount</Text>
          <View className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex-row items-center mb-5">
            <Text className="text-gray-400 text-lg mr-2">Rs.</Text>
            <TextInput
              className="text-white text-2xl font-bold flex-1"
              placeholder="0"
              placeholderTextColor="#4B5563"
              keyboardType="numeric"
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ""))}
              maxLength={6}
            />
          </View>

          {/* Description (optional) */}
          <Text className="text-gray-400 text-sm mb-2">Note (optional)</Text>
          <View className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mb-8">
            <TextInput
              className="text-white text-base"
              placeholder="What's this for?"
              placeholderTextColor="#4B5563"
              value={description}
              onChangeText={setDescription}
              maxLength={100}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${
              !phone || !amount || isPending ? "bg-accent/40" : "bg-accent"
            }`}
            onPress={handleSend}
            disabled={!phone || !amount || isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-bold">
                {amount ? `Send Rs. ${Number(amount).toLocaleString()}` : "Enter Details"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}