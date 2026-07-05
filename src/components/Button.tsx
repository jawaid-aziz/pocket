import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
} from "react-native";
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
  ...rest
}: ButtonProps) {
  const v = variantStyles[variant];
  return (
    <Pressable
      disabled={disabled || loading}
      style={(state) => [
        {
          backgroundColor: v.bg,
          borderRadius: radius.sm + 2,
          paddingVertical: spacing(3) + 2,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : state.pressed ? 0.85 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        typeof style === "function" ? style(state) : style,
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
