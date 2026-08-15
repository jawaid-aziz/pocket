import { Pressable, PressableProps, ViewStyle } from "react-native";
import { ReactNode } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { tapFeedback } from "../utils/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
  children: ReactNode;
  scaleTo?: number;
  style?: ViewStyle | ViewStyle[];
  haptic?: boolean;
}

// Uniform press feedback — scales the child down slightly while held and
// springs it back on release. Keeps every interactive element feeling tactile.
export function PressableScale({
  children,
  scaleTo = 0.96,
  style,
  haptic = false,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        scale.value = withTiming(scaleTo, { duration: 90 });
        if (haptic) tapFeedback();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: 160 });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) tapFeedback();
        onPress?.(e);
      }}
      style={[style as any, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}