import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
} from "react-native";
import { useState } from "react";
import { colors, radius, spacing } from "../theme/tokens";

type Variant = "primary" | "secondary" | "danger";

type ButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantStyles: Record<
  Variant,
  { bg: string; fg: string; border?: string }
> = {
  primary: { bg: colors.primary, fg: colors.onPrimary },
  secondary: { bg: colors.surfaceAlt, fg: colors.textPrimary },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

export function Button({
  label,
  variant = "primary",
  loading = false,
  fullWidth = true,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const v = variantStyles[variant];
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={[
        {
          backgroundColor: v.bg,
          borderRadius: radius.sm + 2,
          paddingVertical: spacing(3) + 2,
          alignItems: "center",
          justifyContent: "center",
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        style as any,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <Text style={{ color: v.fg, fontSize: 15, fontWeight: "700" }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}