import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { CheckCircle2 } from "lucide-react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useTopUp } from "../../src/api/hooks/useAccount";
import { fetchMe } from "../../src/api/account";
import { useWalletStore } from "../../src/store/walletStore";
import { Button } from "../../src/components/Button";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { PressableScale } from "../../src/components/PressableScale";
import { formatPKR } from "../../src/utils/format";
import { successFeedback } from "../../src/utils/haptics";
import { colors, radius, spacing } from "../../src/theme/tokens";

const QUICK_AMOUNTS = [500, 1000, 2000];
const MAX_AMOUNT = 50000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The wallet is credited server-side by Stripe's webhook. Poll the balance
// until it reflects the top-up so we never claim money was added when it
// wasn't. Returns false after ~15s if the credit hasn't landed.
async function waitForCredit(balanceBefore: number, amount: number): Promise<boolean> {
  for (let i = 0; i < 10; i++) {
    await wait(1500);
    try {
      const { user } = await fetchMe();
      if (Number(user.balance) >= balanceBefore + amount) return true;
    } catch {
      // Transient fetch failure — keep polling
    }
  }
  return false;
}

type Step = "amount" | "card" | "confirming" | "done";

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: "amount", label: "Amount" },
  { key: "card", label: "Card" },
  { key: "confirming", label: "Confirm" },
];

function StepIndicator({ step }: { step: Step }) {
  const activeIndex = STEP_LABELS.findIndex((s) => s.key === step);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing(5),
      }}
    >
      {STEP_LABELS.map((s, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <View
            key={s.key}
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: i < 2 ? 1 : undefined,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor:
                    isDone || isActive ? colors.primary : colors.surfaceAlt,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color:
                      isDone || isActive
                        ? colors.onPrimary
                        : colors.textTertiary,
                  }}
                >
                  {i + 1}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: isActive ? colors.textPrimary : colors.textTertiary,
                  marginTop: 4,
                }}
              >
                {s.label}
              </Text>
            </View>
            {i < STEP_LABELS.length - 1 && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: isDone ? colors.primary : colors.border,
                  marginHorizontal: 6,
                  marginBottom: 14,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function LoadScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const topUp = useTopUp();
  const { confirmPayment } = useStripe();

  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("amount");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  // Reset to "" and derive the display value from the API response so a
  // non-USD STRIPE_CURRENCY config never shows a stale hardcoded default.
  const [currency, setCurrency] = useState<string>("");
  const [cardComplete, setCardComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const chargeCurrency = (currency || "usd").toUpperCase();

  const handleCreateIntent = () => {
    setError(null);
    // Guard against a fast double-tap firing two intents before the button's
    // loading state has re-rendered (would orphan a PENDING ledger row).
    if (topUp.isPending) return;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0)
      return setError("Enter a valid amount.");
    if (numericAmount > MAX_AMOUNT)
      return setError(`Maximum top-up is Rs. ${MAX_AMOUNT.toLocaleString()}.`);

    topUp.mutate(numericAmount, {
      onSuccess: (data) => {
        setClientSecret(data.clientSecret);
        setCurrency(data.currency || "usd");
        setStep("card");
      },
      onError: (err: any) =>
        setError(err.message || "Could not start top-up. Please try again."),
    });
  };

  const handleConfirmCard = async () => {
    if (!clientSecret || !cardComplete) return;
    setError(null);
    setConfirming(true);
    setStep("confirming");

    const balanceBefore = useWalletStore.getState().balance;
    const expected = Number(amount);

    try {
      const { error: stripeError, paymentIntent } = await confirmPayment(
        clientSecret,
        {
          paymentMethodType: "Card",
        },
      );

      if (stripeError) {
        setError(stripeError.message);
        setStep("card");
        setConfirming(false);
        return;
      }

      if (paymentIntent?.status === "Succeeded") {
        // Verify the webhook actually credited the wallet before claiming success.
        const credited = await waitForCredit(balanceBefore, expected);
        await qc.invalidateQueries({ queryKey: ["me"] });
        await qc.invalidateQueries({ queryKey: ["transactions"] });
        successFeedback();
        if (!credited) {
          setError(
            "Payment received, but your balance is still updating. Please check again shortly.",
          );
        }
        setStep("done");
        setConfirming(false);
      } else {
        setError("Payment did not complete. Please try again.");
        setStep("card");
        setConfirming(false);
      }
    } catch (err) {
      // confirmPayment can reject on native/network failures — never leave
      // the UI stuck on the confirming spinner with no way to retry.
      setError(
        err instanceof Error
          ? err.message
          : "Payment confirmation failed. Please try again.",
      );
      setStep("card");
      setConfirming(false);
    }
  };

  function resetFlow() {
    setAmount("");
    setStep("amount");
    setClientSecret(null);
    setCurrency("");
    setCardComplete(false);
    setError(null);
  }

  function goBackToAmount() {
    // Discard the current intent's client state so the next "Load money"
    // starts clean instead of reusing a stale PaymentIntent.
    setStep("amount");
    setClientSecret(null);
    setCardComplete(false);
    setError(null);
  }

  if (step === "done") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Load wallet" />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: spacing(4),
          }}
        >
          <Animated.View entering={FadeIn.duration(300)}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.successSoft,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: spacing(4),
              }}
            >
              <CheckCircle2 size={36} color={colors.success} />
            </View>
          </Animated.View>
          <Animated.Text
            entering={FadeInDown.duration(300)}
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: colors.textPrimary,
              marginBottom: spacing(2),
            }}
          >
            Wallet loaded successfully
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(60).duration(300)}
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              marginBottom: spacing(4),
              textAlign: "center",
            }}
          >
            Rs. {formatPKR(Number(amount))} has been added to your
            balance.
          </Animated.Text>
          <Button
            label="Back to dashboard"
            onPress={() => {
              resetFlow();
              router.push("/(tabs)" as any);
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Load wallet" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing(4) }}
        keyboardShouldPersistTaps="handled"
      >
        <StepIndicator step={step} />

        {step === "amount" && (
          <>
            <Text
              style={{
                fontSize: 11,
                color: colors.textSecondary,
                marginBottom: spacing(2),
              }}
            >
              Quick amounts
            </Text>
            <View
              style={{ flexDirection: "row", gap: 8, marginBottom: spacing(4) }}
            >
              {QUICK_AMOUNTS.map((val) => (
                <PressableScale
                  key={val}
                  onPress={() => setAmount(String(val))}
                  haptic
                  style={{
                    backgroundColor:
                      amount === String(val)
                        ? colors.primarySoftStrong
                        : colors.surfaceAlt,
                    borderRadius: radius.pill,
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colors.textPrimary }}>
                    Rs. {formatPKR(val, { decimals: 0 })}
                  </Text>
                </PressableScale>
              ))}
            </View>

            <Text
              style={{
                fontSize: 11,
                color: colors.textSecondary,
                marginBottom: 4,
              }}
            >
              Enter amount
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
              label="Load money"
              onPress={handleCreateIntent}
              loading={topUp.isPending}
            />

            <Text
              style={{
                fontSize: 11,
                color: colors.textTertiary,
                marginTop: spacing(3),
                textAlign: "center",
              }}
            >
              Funds are verified via Stripe secure test sandbox before being
              added to your wallet.
            </Text>
          </>
        )}

        {(step === "card" || step === "confirming") && (
          <>
            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginBottom: spacing(2),
              }}
            >
              Loading Rs. {formatPKR(Number(amount))} — enter test card
              details
            </Text>

            <Text
              style={{
                fontSize: 11,
                color: colors.textTertiary,
                marginBottom: spacing(3),
                lineHeight: 16,
              }}
            >
              Stripe test mode charges {formatPKR(Number(amount))}{" "}
              {chargeCurrency} for this top-up. PKR is not supported by
              Stripe, so the same numeric value is charged in {chargeCurrency}.
              The wallet balance is credited in Rs.
            </Text>

            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: "4242 4242 4242 4242" }}
              cardStyle={{
                backgroundColor: colors.surfaceAlt,
                textColor: colors.textPrimary,
                placeholderColor: colors.textTertiary,
                borderRadius: 8,
                fontSize: 15,
              }}
              style={{ width: "100%", height: 50, marginBottom: spacing(3) }}
              onCardChange={(details) => setCardComplete(details.complete)}
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

            {confirming ? (
              <View
                style={{ alignItems: "center", paddingVertical: spacing(4) }}
              >
                <ActivityIndicator color={colors.primary} />
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: spacing(2),
                  }}
                >
                  Confirming payment...
                </Text>
              </View>
            ) : (
              <>
                <Button
                  label={`Pay ${chargeCurrency} ${formatPKR(Number(amount))} & add funds`}
                  onPress={handleConfirmCard}
                  disabled={!cardComplete}
                />
                <View style={{ marginTop: spacing(3) }}>
                  <Button
                    label="Change amount"
                    variant="secondary"
                    onPress={goBackToAmount}
                  />
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
