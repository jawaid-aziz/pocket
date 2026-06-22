import { View, Text } from 'react-native';

export type Transaction = {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: string;
};

interface Props {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: Props) {
  const isCredit = transaction.type === 'CREDIT';

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-white/5">
      {/* Icon + Description */}
      <View className="flex-row items-center gap-3">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            isCredit ? 'bg-accent/20' : 'bg-red-500/20'
          }`}
        >
          <Text className="text-lg">{isCredit ? '↓' : '↑'}</Text>
        </View>
        <View>
          <Text className="text-white text-sm font-medium">
            {transaction.description}
          </Text>
          <Text className="text-gray-500 text-xs mt-0.5">
            {new Date(transaction.createdAt).toLocaleDateString('en-PK', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* Amount */}
      <Text
        className={`text-sm font-semibold ${
          isCredit ? 'text-accent' : 'text-red-400'
        }`}
      >
        {isCredit ? '+' : '-'}Rs. {transaction.amount.toLocaleString()}
      </Text>
    </View>
  );
}