import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";
import { colors, radius, spacing, typography } from "../theme/tokens";
import { formatPKR } from "../utils/format";

function useAnimatedNumber(value: number) {
  const display = useSharedValue(value);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    display.value = withSpring(value, { damping: 18, stiffness: 140 });
  }, [value, display]);

  useEffect(() => {
    const id = setInterval(() => {
      const current = display.value;
      if (Math.abs(current - value) < 0.01) {
        setShown(value);
        clearInterval(id);
      } else {
        setShown(current);
      }
    }, 24);
    return () => clearInterval(id);
  }, [value, display]);

  return shown;
}

export function BalanceCard({ balance }: { balance: number }) {
  const [hidden, setHidden] = useState(false);
  const animated = useAnimatedNumber(balance);

  return (
    <View
      style={{
        backgroundColor: colors.primaryDark,
        borderRadius: radius.lg,
        padding: spacing(4) + 2,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
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
      <Animated.Text style={{ ...typography.amountLg, marginTop: 6 }}>
        {hidden ? "Rs. ••••••" : `Rs. ${formatPKR(animated, { decimals: 2 })}`}
      </Animated.Text>
    </View>
  );
}