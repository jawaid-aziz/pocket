import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import { useMe } from '../../src/api/hooks/useAccount';
import { useTransactions } from '../../src/api/hooks/useTransactions';
import { useWalletStore } from '../../src/store/walletStore';
import { BalanceCard } from '../../src/components/BalanceCard';
import { QuickActions } from '../../src/components/QuickActions';
import { SoundBoxStatusCard } from '../../src/components/SoundBoxStatusCard';
import { TransactionItem } from '../../src/components/TransactionItem';
import { colors, spacing } from '../../src/theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { data: user, isLoading: userLoading, refetch: refetchMe } = useMe();
  const { data: transactions, isLoading: txLoading, refetch: refetchTx } = useTransactions();
  const balance = useWalletStore((s) => s.balance);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchMe(), refetchTx()]);
    setRefreshing(false);
  }, [refetchMe, refetchTx]);

  const recent = (transactions ?? []).slice(0, 5);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: spacing(8) }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={{ paddingHorizontal: spacing(4), paddingTop: insets.top + spacing(4) }}>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>Good evening</Text>
        <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginTop: 2 }}>
          {userLoading ? 'Loading...' : user?.name ?? 'there'}
        </Text>
      </View>

      <View style={{ paddingHorizontal: spacing(4), marginTop: spacing(2) }}>
        <BalanceCard balance={balance ?? 0} />
      </View>

      <View style={{ paddingHorizontal: spacing(4), marginTop: spacing(4) }}>
        <QuickActions />
      </View>

      <View style={{ paddingHorizontal: spacing(4), marginTop: spacing(4) }}>
        <SoundBoxStatusCard deviceName="SoundBox 01" online={false} lastAnnouncement="Not connected yet" />
      </View>

      <View
        style={{
          paddingHorizontal: spacing(4),
          marginTop: spacing(4),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>Recent activity</Text>
        <Pressable onPress={() => router.push('/(tabs)/transactions' as any)}>
          <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>See all</Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: spacing(4), marginTop: spacing(2) }}>
        {txLoading ? (
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Loading transactions...</Text>
        ) : recent.length === 0 ? (
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            No transactions yet. Load your wallet to get started.
          </Text>
        ) : (
          recent.map((tx) => <TransactionItem key={tx.id} tx={tx} />)
        )}
      </View>
    </ScrollView>
  );
}