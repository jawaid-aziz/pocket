// components/TransactionItem.tsx
import { View, Text } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react-native';
import { colors, spacing, txColors, TxKind } from '../theme/tokens';

export type BackendTransaction = {
  id: string;
  type: 'TOPUP' | 'TRANSFER_SENT' | 'TRANSFER_RECEIVED';
  amount: number | string;
  description?: string | null;
  createdAt: string;
};

function toKind(type: BackendTransaction['type']): TxKind {
  if (type === 'TOPUP') return 'topup';
  if (type === 'TRANSFER_RECEIVED') return 'received';
  return 'sent';
}

function toLabel(tx: BackendTransaction): string {
  if (tx.type === 'TOPUP') return 'Wallet top-up';
  return tx.description || (tx.type === 'TRANSFER_SENT' ? 'Sent' : 'Received');
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

const icons: Record<TxKind, React.ComponentType<any>> = {
  received: ArrowDownLeft,
  sent: ArrowUpRight,
  topup: Wallet,
};

export function TransactionItem({ tx }: { tx: BackendTransaction }) {
  const kind = toKind(tx.type);
  const { bg, fg, sign } = txColors[kind];
  const Icon = icons[kind];
  const amount = Number(tx.amount);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: spacing(3),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={17} color={fg} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{toLabel(tx)}</Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{timeAgo(tx.createdAt)}</Text>
      </View>

      <Text style={{ fontSize: 14, fontWeight: '700', color: fg }}>
        {sign}Rs. {amount.toLocaleString()}
      </Text>
    </View>
  );
}