import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useTopUp } from "@/src/api/hooks/useAccount";
import { useWalletStore } from "@/src/store/walletStore";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function LoadMoneyScreen() {
  const insets = useSafeAreaInsets();
  const balance = useWalletStore((s) => s.balance);
  const { mutate: topUp, isPending } = useTopUp();
  const [amount, setAmount] = useState("");

  function handleAmountInput(val: string) {
    // Only allow digits
    setAmount(val.replace(/[^0-9]/g, ""));
  }

  function handleTopUp() {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount to load.");
      return;
    }
    if (parsed > 50000) {
      Alert.alert("Limit Exceeded", "Maximum top-up per transaction is Rs. 50,000.");
      return;
    }

    topUp(parsed, {
      onSuccess: () => {
        Alert.alert("Success", `Rs. ${parsed.toLocaleString()} added to your wallet.`, [
          { text: "OK", onPress: () => router.back() },
        ]);
        setAmount("");
      },
      onError: (err: any) => {
        Alert.alert("Failed", err?.message || "Top-up failed. Please try again.");
      },
    });
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
          <Text className="text-white text-xl font-bold">Load Money</Text>
        </View>

        <View className="px-6 flex-1">

          {/* Current Balance */}
          <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
            <Text className="text-gray-400 text-sm mb-1">Current Balance</Text>
            <Text className="text-white text-3xl font-bold">
              Rs. {balance.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {/* Amount Input */}
          <Text className="text-gray-400 text-sm mb-2">Enter Amount</Text>
          <View className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex-row items-center mb-6">
            <Text className="text-gray-400 text-lg mr-2">Rs.</Text>
            <TextInput
              className="text-white text-2xl font-bold flex-1"
              placeholder="0"
              placeholderTextColor="#4B5563"
              keyboardType="numeric"
              value={amount}
              onChangeText={handleAmountInput}
              maxLength={6}
            />
          </View>

          {/* Quick Amount Buttons */}
          <Text className="text-gray-400 text-sm mb-3">Quick Add</Text>
          <View className="flex-row flex-wrap gap-3 mb-8">
            {QUICK_AMOUNTS.map((preset) => (
              <TouchableOpacity
                key={preset}
                className={`flex-1 min-w-[40%] border rounded-xl py-3 items-center ${
                  amount === String(preset)
                    ? "bg-accent border-accent"
                    : "bg-white/5 border-white/10"
                }`}
                onPress={() => setAmount(String(preset))}
              >
                <Text className="text-white font-semibold">
                  Rs. {preset.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Top Up Button */}
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${
              !amount || isPending ? "bg-accent/40" : "bg-accent"
            }`}
            onPress={handleTopUp}
            disabled={!amount || isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-bold">
                {amount
                  ? `Add Rs. ${Number(amount).toLocaleString()} to Wallet`
                  : "Enter an Amount"}
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-gray-600 text-xs text-center mt-4">
            Max top-up per transaction: Rs. 50,000
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}