import { View, DimensionValue } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { colors, radius } from "../theme/tokens";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  style?: any;
  borderRadius?: number;
}

// Pulsing placeholder used while data is loading — far calmer than a bare
// spinner and keeps the screen layout stable so nothing jumps when it fills in.
export function Skeleton({
  width = "100%",
  height = 16,
  style,
  borderRadius = radius.sm,
}: SkeletonProps) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceAlt,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonLine({ width = "100%", height = 14 }: SkeletonProps) {
  return <Skeleton width={width} height={height} />;
}

export function TransactionSkeleton() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
      }}
    >
      <Skeleton width={36} height={36} borderRadius={18} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="55%" height={13} />
        <Skeleton width="30%" height={11} />
      </View>
      <Skeleton width={64} height={14} />
    </View>
  );
}

export function BalanceSkeleton() {
  return (
    <View style={{ padding: 18 }}>
      <Skeleton width="40%" height={12} />
      <View style={{ height: 8 }} />
      <Skeleton width="55%" height={30} borderRadius={6} />
    </View>
  );
}