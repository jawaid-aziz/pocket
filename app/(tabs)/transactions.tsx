import { useMemo, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { Receipt } from 'lucide-react-native';
import { useTransactionsFeed } from '../../src/api/hooks/useTransactions';
import { TransactionsPage } from '../../src/api/transactions';
import { TransactionItem } from '../../src/components/TransactionItem';
import { TransactionSkeleton } from '../../src/components/Skeleton';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, spacing } from '../../src/theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function groupLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfDay) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-GB', { weekday: 'long' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TransactionsScreen() {
  const feed = useTransactionsFeed();
  const insets = useSafeAreaInsets();

  const pages = feed.data?.pages;

  const sections = useMemo(() => {
    const groups = new Map<string, TransactionsPage['transactions']>();
    for (const page of pages ?? []) {
      for (const tx of page.transactions) {
        const label = groupLabel(tx.createdAt);
        const arr = groups.get(label) ?? [];
        arr.push(tx);
        groups.set(label, arr);
      }
    }
    return Array.from(groups.entries());
  }, [pages]);

  const isLoading = feed.isLoading;
  const isRefreshing = feed.isRefetching && !feed.isFetchingNextPage;

  const onRefresh = useCallback(() => {
    feed.refetch();
  }, [feed]);

  const onEndReached = useCallback(() => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) {
      feed.fetchNextPage();
    }
  }, [feed]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing(4), paddingTop: insets.top + spacing(4) }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing(3) }}>
        Transactions
      </Text>

      {isLoading ? (
        <View>
          <TransactionSkeleton />
          <TransactionSkeleton />
          <TransactionSkeleton />
          <TransactionSkeleton />
        </View>
      ) : feed.isError ? (
        <EmptyState
          icon={Receipt}
          title="Couldn't load transactions"
          subtitle="Check your connection and try again."
          action={
            <Pressable onPress={() => feed.refetch()}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Tap to retry</Text>
            </Pressable>
          }
        />
      ) : !sections.length ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          subtitle="Your activity will show up here once you load or send money."
        />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item[0]}
          renderItem={({ item }) => (
            <View style={{ marginBottom: spacing(3) }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 }}>
                {item[0]}
              </Text>
              {item[1].map((tx) => (
                <TransactionItem key={tx.id} tx={tx} />
              ))}
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            feed.isFetchingNextPage ? (
              <View style={{ paddingVertical: spacing(4), alignItems: 'center' }}>
                <Text style={{ color: colors.textTertiary, fontSize: 12 }}>Loading more…</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}