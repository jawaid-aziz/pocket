import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { colors } from "@/src/theme/tokens";

interface PinDotsProps {
  length: number;
  filled: number;
  error?: boolean;
}

export default function PinDots({ length, filled, error }: PinDotsProps) {
  const shake = useSharedValue(0);

  useEffect(() => {
    if (error) {
      shake.value = withSequence(
        withTiming(-8, { duration: 45 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    }
  }, [error, shake]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <Animated.View
      style={[
        { flexDirection: "row", gap: 16, justifyContent: "center", marginVertical: 32 },
        animatedStyle,
      ]}
    >
      {Array.from({ length }).map((_, i) => {
        const isFilled = i < filled;
        return (
          <View
            key={i}
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: error ? colors.danger : isFilled ? colors.primary : colors.border,
              backgroundColor: error ? colors.danger : isFilled ? colors.primary : "transparent",
            }}
          />
        );
      })}
    </Animated.View>
  );
}