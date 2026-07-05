import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { CreditCard } from 'lucide-react-native';
import { useTopUp } from '../../src/api/hooks/useAccount';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing } from '../../src/theme/tokens';

const QUICK_AMOUNTS = [500, 1000, 2000];
const MAX_AMOUNT = 50000;

export default function LoadScreen() {
  const router = useRouter();
  const topUp = useTopUp();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

const handleTopUp = () => {
  setError(null);
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) return setError('Enter a valid amount.');
  if (numericAmount > MAX_AMOUNT) return setError(`Maximum top-up is Rs. ${MAX_AMOUNT.toLocaleString()}.`);

  topUp.mutate(numericAmount, {
    onSuccess: () => router.push('/(tabs)' as any),
    onError: () => setError('Top-up failed. Please try again.'),
  });
};

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing(4) }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing(3) }}>
        Load wallet
      </Text>

      <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: spacing(2) }}>Quick amounts</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing(4) }}>
        {QUICK_AMOUNTS.map((val) => (
          <Pressable
            key={val}
            onPress={() => setAmount(String(val))}
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.pill,
              paddingVertical: 6,
              paddingHorizontal: 14,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.textPrimary }}>Rs. {val.toLocaleString()}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 4 }}>Enter amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Rs. 0"
        keyboardType="numeric"
        style={{
          backgroundColor: colors.surfaceAlt,
          borderRadius: radius.sm,
          padding: spacing(3),
          fontSize: 20,
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: spacing(3),
        }}
      />

      <View
        style={{
          backgroundColor: colors.surfaceAlt,
          borderRadius: radius.sm,
          padding: spacing(3),
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: spacing(3),
        }}
      >
        <CreditCard size={16} color={colors.textSecondary} />
        <Text style={{ fontSize: 12, color: colors.textPrimary }}>Visa ending 4242 (Stripe test)</Text>
      </View>

      {error && <Text style={{ color: colors.danger, fontSize: 12, marginBottom: spacing(3) }}>{error}</Text>}

      <Button label="Add funds" onPress={handleTopUp} loading={topUp.isPending} />
    </ScrollView>
  );
}