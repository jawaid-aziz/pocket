import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';

export function BalanceCard({ balance }: { balance: number }) {
  const [hidden, setHidden] = useState(false);

  return (
    <View
      style={{
        backgroundColor: colors.primaryDark,
        borderRadius: radius.lg,
        padding: spacing(4) + 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ ...typography.captionStrong, color: colors.onPrimarySoft }}>
          Available balance
        </Text>
        <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel="Toggle balance visibility">
          {hidden ? (
            <EyeOff size={18} color={colors.onPrimarySoft} />
          ) : (
            <Eye size={18} color={colors.onPrimarySoft} />
          )}
        </Pressable>
      </View>
      <Text style={{ ...typography.amountLg, marginTop: 6 }}>
        {hidden ? 'Rs. ••••••' : `Rs. ${balance.toLocaleString()}`}
      </Text>
    </View>
  );
}