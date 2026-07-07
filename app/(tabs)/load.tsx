import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { useTopUp } from '../../src/api/hooks/useAccount';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing } from '../../src/theme/tokens';

const QUICK_AMOUNTS = [500, 1000, 2000];
const MAX_AMOUNT = 50000;

type Step = 'amount' | 'card' | 'confirming' | 'done';

export default function LoadScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const topUp = useTopUp();
  const { confirmPayment } = useStripe();

  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<Step>('amount');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleCreateIntent = () => {
    setError(null);
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) return setError('Enter a valid amount.');
    if (numericAmount > MAX_AMOUNT) return setError(`Maximum top-up is Rs. ${MAX_AMOUNT.toLocaleString()}.`);

    topUp.mutate(numericAmount, {
      onSuccess: (data) => {
        setClientSecret(data.clientSecret);
        setStep('card');
      },
      onError: () => setError('Could not start top-up. Please try again.'),
    });
  };

  const handleConfirmCard = async () => {
    if (!clientSecret || !cardComplete) return;
    setError(null);
    setConfirming(true);
    setStep('confirming');

    const { error: stripeError, paymentIntent } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
    });

    if (stripeError) {
      setError(stripeError.message);
      setStep('card');
      setConfirming(false);
      return;
    }

    if (paymentIntent?.status === 'Succeeded') {
      // Webhook credits the wallet server-side; give it a moment, then refetch.
      setTimeout(async () => {
        await qc.invalidateQueries({ queryKey: ['me'] });
        await qc.invalidateQueries({ queryKey: ['transactions'] });
        setStep('done');
        setConfirming(false);
      }, 1500);
    } else {
      setError('Payment did not complete. Please try again.');
      setStep('card');
      setConfirming(false);
    }
  };

  if (step === 'done') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing(4) }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing(2) }}>
          Wallet loaded successfully
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing(4), textAlign: 'center' }}>
          Rs. {Number(amount).toLocaleString()} has been added to your balance.
        </Text>
        <Button label="Back to dashboard" onPress={() => router.push('/(tabs)' as any)} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing(4) }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing(3) }}>
        Load wallet
      </Text>

      {step === 'amount' && (
        <>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: spacing(2) }}>
            Quick amounts
          </Text>
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

          {error && <Text style={{ color: colors.danger, fontSize: 12, marginBottom: spacing(3) }}>{error}</Text>}

          <Button label="Continue" onPress={handleCreateIntent} loading={topUp.isPending} />
        </>
      )}

      {(step === 'card' || step === 'confirming') && (
        <>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: spacing(2) }}>
            Loading Rs. {Number(amount).toLocaleString()} — enter test card details
          </Text>

          <CardField
            postalCodeEnabled={false}
            placeholders={{ number: '4242 4242 4242 4242' }}
            style={{ width: '100%', height: 50, marginBottom: spacing(3) }}
            onCardChange={(details) => setCardComplete(details.complete)}
          />

          {error && <Text style={{ color: colors.danger, fontSize: 12, marginBottom: spacing(3) }}>{error}</Text>}

          {confirming ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing(4) }}>
              <ActivityIndicator color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: spacing(2) }}>
                Confirming payment...
              </Text>
            </View>
          ) : (
            <Button
              label="Pay & add funds"
              onPress={handleConfirmCard}
              disabled={!cardComplete}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}