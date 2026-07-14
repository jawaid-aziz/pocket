import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useTransactions } from '../../src/api/hooks/useTransactions';
import { TransactionItem } from '../../src/components/TransactionItem';
import { colors, spacing } from '../../src/theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TransactionsScreen() {
  const { data: transactions, isLoading } = useTransactions();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing(4), paddingTop: insets.top + spacing(4) }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing(3) }}>
        Transactions
      </Text>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : !transactions?.length ? (
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No transactions yet.</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => <TransactionItem tx={item} />}
        />
      )}
    </View>
  );
}