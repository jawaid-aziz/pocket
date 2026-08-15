import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import { Receipt } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useMe } from '../../src/api/hooks/useAccount';
import { useTransactions } from '../../src/api/hooks/useTransactions';
import { useWalletStore } from '../../src/store/walletStore';
import { BalanceCard } from '../../src/components/BalanceCard';
import { QuickActions } from '../../src/components/QuickActions';
import { SoundBoxStatusCard } from '../../src/components/SoundBoxStatusCard';
import { TransactionItem } from '../../src/components/TransactionItem';
import { EmptyState } from '../../src/components/EmptyState';
import {
  Skeleton,
  TransactionSkeleton,
  BalanceSkeleton,
} from '../../src/components/Skeleton';
import { PressableScale } from '../../src/components/PressableScale';
import { colors, spacing, typography } from '../../src/theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { data: user, isLoading: userLoading, refetch: refetchMe } = useMe();
  const { data: transactions, isLoading: txLoading, isError: txError, refetch: refetchTx } = useTransactions();
  const balance = useWalletStore((s) => s.balance);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchMe(), refetchTx()]);
    setRefreshing(false);
  }, [refetchMe, refetchTx]);

  const recent = (transactions ?? []).slice(0, 5);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: spacing(8) }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Animated.View entering={FadeIn.duration(300)} style={{ paddingHorizontal: spacing(4), paddingTop: insets.top + spacing(4) }}>
        <Text style={{ ...typography.caption }}>{greeting}</Text>
        {userLoading ? (
          <Skeleton width={140} height={20} style={{ marginTop: 6 }} />
        ) : (
          <Text style={{ ...typography.h2, marginTop: 2 }}>
            {user?.name ?? "there"}
          </Text>
        )}
        <Text style={{ ...typography.micro, color: colors.textTertiary, marginTop: 2 }}>
          {today}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(350)} style={{ paddingHorizontal: spacing(4), marginTop: spacing(3) }}>
        {userLoading ? (
          <BalanceSkeleton />
        ) : (
          <BalanceCard balance={balance ?? 0} />
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(350)} style={{ paddingHorizontal: spacing(4), marginTop: spacing(4) }}>
        <QuickActions />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140).duration(350)} style={{ paddingHorizontal: spacing(4), marginTop: spacing(4) }}>
        <SoundBoxStatusCard deviceName="SoundBox 01" online={false} lastAnnouncement="Not connected yet" />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(350)}
        style={{
          paddingHorizontal: spacing(4),
          marginTop: spacing(4),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>Recent activity</Text>
        <PressableScale onPress={() => router.push('/(tabs)/transactions' as any)} haptic>
          <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>See all</Text>
        </PressableScale>
      </Animated.View>

      <View style={{ paddingHorizontal: spacing(4), marginTop: spacing(2) }}>
        {txLoading ? (
          <>
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
          </>
        ) : txError ? (
          <EmptyState
            icon={Receipt}
            title="Couldn't load your activity"
            subtitle="Check your connection and try again."
            action={
              <Pressable onPress={() => refetchTx()}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Tap to retry</Text>
              </Pressable>
            }
          />
        ) : recent.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            subtitle="Load your wallet to see activity here."
            action={
              <PressableScale onPress={() => router.push('/(tabs)/load' as any)} haptic>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Load money</Text>
              </PressableScale>
            }
          />
        ) : (
          recent.map((tx, i) => (
            <Animated.View key={tx.id} entering={FadeInDown.delay(i * 40).duration(250)}>
              <TransactionItem tx={tx} />
            </Animated.View>
          ))
        )}
      </View>
    </ScrollView>
  );
}