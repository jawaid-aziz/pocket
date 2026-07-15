import { useState, useMemo } from "react";
import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import {
  useTransactions,
  useSendMoney,
} from "../../src/api/hooks/useTransactions";
import { Button } from "../../src/components/Button";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { colors, radius, spacing } from "../../src/theme/tokens";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SendScreen() {
  const router = useRouter();
  const { data: transactions } = useTransactions();
  const sendMoney = useSendMoney();
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recentContacts = useMemo(() => {
    const sent = (transactions ?? []).filter((t) => t.type === "TRANSFER_SENT");
    const seen = new Map<string, { name: string; phone: string }>();
    for (const t of sent) {
      const user = t.counterpartWallet?.user;
      if (!user) continue;
      const label = user.name || user.phone;
      if (!seen.has(label)) seen.set(label, { name: label, phone: user.phone });
    }
    return Array.from(seen.values()).slice(0, 2);
  }, [transactions]);

  const handleSend = () => {
    setError(null);
    const numericAmount = Number(amount);

    if (!phone.trim()) return setError("Enter a recipient phone number.");
    if (!numericAmount || numericAmount <= 0)
      return setError("Enter a valid amount.");

    sendMoney.mutate(
      { recipientPhone: phone, amount: numericAmount },
      {
        onSuccess: () => {
          setPhone("");
          setAmount("");
          router.push("/(tabs)" as any);
        },
        onError: () => setError("Send failed. Check the number and try again."),
      },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Send money" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing(4) }}
        keyboardShouldPersistTaps="handled"
      >
        {recentContacts.length > 0 && (
          <>
            <Text
              style={{
                fontSize: 11,
                color: colors.textSecondary,
                marginBottom: spacing(2),
              }}
            >
              Send again to
            </Text>
            <View
              style={{ flexDirection: "row", gap: 14, marginBottom: spacing(4) }}
            >
              {recentContacts.map((contact) => (
                <Pressable
                  key={contact.phone}
                  style={{ alignItems: "center" }}
                  onPress={() => setPhone(contact.phone)}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: colors.primarySoft,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: colors.primary,
                      }}
                    >
                      {initials(contact.name)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 10,
                      color: colors.textSecondary,
                      marginTop: 4,
                    }}
                  >
                    {contact.name.split(" ")[0]}
                  </Text>
                </Pressable>
              ))}
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.surfaceAlt,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={16} color={colors.textSecondary} />
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  New
                </Text>
              </View>
            </View>
          </>
        )}

        <Text
          style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 4 }}
        >
          Recipient phone number
        </Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="03XX-XXXXXXX"
          placeholderTextColor={colors.textTertiary}
          keyboardType="phone-pad"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.sm,
            padding: spacing(3),
            fontSize: 14,
            color: colors.textPrimary,
            marginBottom: spacing(3),
          }}
        />

        <Text
          style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 4 }}
        >
          Amount
        </Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="Rs. 0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.sm,
            padding: spacing(3),
            fontSize: 20,
            fontWeight: "700",
            color: colors.textPrimary,
            marginBottom: spacing(3),
          }}
        />

        {error && (
          <Text
            style={{
              color: colors.danger,
              fontSize: 12,
              marginBottom: spacing(3),
            }}
          >
            {error}
          </Text>
        )}

        <Button
          label="Send money"
          onPress={handleSend}
          loading={sendMoney.isPending}
        />

        <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: spacing(3), textAlign: "center" }}>
          Internal transfers settle instantly as a closed-loop ledger entry — no Stripe involved.
        </Text>
      </ScrollView>
    </View>
  );
}