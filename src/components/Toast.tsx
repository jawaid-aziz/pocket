import { View, Text, StyleSheet } from "react-native";
import { CheckCircle2, AlertCircle, Info } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useToastStore, ToastType } from "../store/toastStore";
import { colors, radius, spacing } from "../theme/tokens";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CONFIG: Record<
  ToastType,
  { bg: string; fg: string; icon: React.ComponentType<any> }
> = {
  success: { bg: colors.success, fg: colors.onPrimary, icon: CheckCircle2 },
  error: { bg: colors.danger, fg: colors.onPrimary, icon: AlertCircle },
  info: { bg: colors.primaryDark, fg: colors.onPrimary, icon: Info },
};

const HEIGHT = 52;

export function ToastHost() {
  const { message, type, visible, hide } = useToastStore();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSequence(
        withTiming(0, { duration: 220 }),
        withDelay(2100, withTiming(-HEIGHT, { duration: 220 })),
      );
      opacity.value = withTiming(1, { duration: 220 });
      // Sync state back so subsequent toasts re-trigger even with same message.
      const t = setTimeout(() => {
        if (useToastStore.getState().visible) hide();
      }, 2600);
      return () => clearTimeout(t);
    }
    translateY.value = withTiming(-HEIGHT, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 });
  }, [visible, message, type, hide, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!message) return null;

  const { bg, fg, icon: Icon } = CONFIG[type];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { top: insets.top + spacing(1) },
        animatedStyle,
      ]}
    >
      <View style={[styles.toast, { backgroundColor: bg }]}>
        <Icon size={18} color={fg} />
        <Text style={[styles.text, { color: fg }]} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
    maxWidth: 340,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2) + 2,
    borderRadius: radius.pill,
    shadowColor: "#0B2B22",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
});