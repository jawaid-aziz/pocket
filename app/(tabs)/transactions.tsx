import {
  View, Text, ScrollView, RefreshControl, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTransactions } from "@/src/api/hooks/useTransactions";
import { Transaction } from "@/src/api/transactions";

function txIcon(type: Transaction["type"]) {
  if (type === "TOPUP") return "＋";
  if (type === "TRANSFER_SENT") return "↑";
  return "↓";
}

function txColor(type: Transaction["type"]) {
  if (type === "TOPUP") return "text-accent";
  if (type === "TRANSFER_SENT") return "text-red-400";
  return "text-accent";
}

function txLabel(tx: Transaction) {
  if (tx.type === "TOPUP") return "Wallet Top-up";
  if (tx.type === "TRANSFER_SENT") {
    return tx.counterpartWallet?.user?.name ||
      tx.counterpartWallet?.user?.phone ||
      tx.description ||
      "Sent";
  }
  return tx.counterpartWallet?.user?.name ||
    tx.counterpartWallet?.user?.phone ||
    tx.description ||
    "Received";
}

function txSign(type: Transaction["type"]) {
  return type === "TRANSFER_SENT" ? "-" : "+";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { data: transactions, isLoading, refetch, isRefetching } = useTransactions();

  return (
    <View className="flex-1 bg-primary" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-4 pb-4">
        <Text className="text-white text-2xl font-bold">Transactions</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#10B981" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6"
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
            <View className="items-center py-24">
              <Text className="text-gray-500 text-sm">No transactions yet</Text>
              <Text className="text-gray-600 text-xs mt-1">
                Send or load money to get started
              </Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View
                key={tx.id}
                className="flex-row items-center bg-white/5 rounded-2xl px-4 py-4 mb-3 border border-white/5"
              >
                {/* Icon */}
                <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-4">
                  <Text className="text-base">{txIcon(tx.type)}</Text>
                </View>

                {/* Label + Date */}
                <View className="flex-1">
                  <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                    {txLabel(tx)}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-0.5">{formatDate(tx.createdAt)}</Text>
                </View>

                {/* Amount */}
                <Text className={`font-bold text-base ${txColor(tx.type)}`}>
                  {txSign(tx.type)}Rs.{" "}
                  {Number(tx.amount).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                </Text>
              </View>
            ))
          )}
          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  );
}