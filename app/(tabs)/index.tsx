import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/src/store/authStore";
import { useWalletStore } from "@/src/store/walletStore";
import TransactionItem, { Transaction } from "@/src/components/TransactionItem";
import { useMe } from "@/src/api/hooks/useAccount";
import { useTransactions } from "@/src/api/hooks/useTransactions";

// Placeholder transactions until backend endpoint is built
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "CREDIT",
    amount: 500,
    description: "Load Money",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    type: "DEBIT",
    amount: 150,
    description: "Sent to Noman",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    type: "CREDIT",
    amount: 1000,
    description: "Load Money",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const balance = useWalletStore((s) => s.balance);
  const { isLoading, refetch, isRefetching } = useMe();
  const {
    data: transactions,
    isRefetching: txRefetching,
    refetch: refetchTx,
  } = useTransactions();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  return (
    <View className="flex-1 bg-primary" style={{ paddingTop: insets.top }}>
      {/* ── TOP HALF: Balance + Actions ── */}
      <View className="px-6 pt-4 pb-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-gray-400 text-sm">{getGreeting()},</Text>
            <Text className="text-white text-xl font-semibold">
              {user?.name || user?.phone || "User"}
            </Text>
          </View>
          {/* Avatar */}
          <View className="w-10 h-10 rounded-full bg-accent/20 items-center justify-center">
            <Text className="text-accent font-bold text-base">
              {(user?.name || user?.phone || "U")[0].toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Balance Card */}
        <View className="bg-white/10 rounded-2xl p-5 mb-6 border border-white/10">
          <Text className="text-gray-400 text-sm mb-1">Total Balance</Text>
          <Text className="text-white text-4xl font-bold">
            Rs. {balance.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
          </Text>
          <Text className="text-gray-500 text-xs mt-2">Pocket Wallet</Text>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-4">
          <TouchableOpacity
            className="flex-1 bg-accent rounded-2xl py-4 items-center"
            onPress={() => router.push("/(tabs)/send" as any)}
          >
            <Text className="text-2xl mb-1">↑</Text>
            <Text className="text-white text-sm font-semibold">Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white/10 border border-white/20 rounded-2xl py-4 items-center"
            onPress={() => router.push("/(tabs)/load" as any)}
          >
            <Text className="text-2xl mb-1">＋</Text>
            <Text className="text-white text-sm font-semibold">Load Money</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── BOTTOM HALF: Transaction Feed ── */}
      <View className="flex-1 bg-white/5 rounded-t-3xl px-6 pt-5">
        <Text className="text-white text-base font-semibold mb-4">
          Recent Transactions
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#10B981"
            />
          }
        >
          {!transactions || transactions.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-gray-500 text-sm">No transactions yet</Text>
              <Text className="text-gray-600 text-xs mt-1">
                Load money to get started
              </Text>
            </View>
          ) : (
            transactions.slice(0, 5).map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={{
                  id: tx.id,
                  type: tx.type === "TRANSFER_SENT" ? "DEBIT" : "CREDIT",
                  amount: Number(tx.amount),
                  description: tx.description || tx.type,
                  createdAt: tx.createdAt,
                }}
              />
            ))
          )}
          {/* Bottom padding so last item isn't cut off by tab bar */}
          <View className="h-8" />
        </ScrollView>
      </View>
    </View>
  );
}
