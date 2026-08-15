import {
  Text,
  ActivityIndicator,
  PressableProps,
} from "react-native";
import { colors, radius, spacing } from "../theme/tokens";
import { PressableScale } from "./PressableScale";

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
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      disabled={isDisabled}
      haptic
      {...rest}
      style={[
        {
          backgroundColor: v.bg,
          borderRadius: radius.sm + 2,
          paddingVertical: spacing(3) + 2,
          alignItems: "center",
          justifyContent: "center",
          opacity: isDisabled ? 0.5 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        style as any,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <Text style={{ color: v.fg, fontSize: 15, fontWeight: "700" }}>
          {label}
        </Text>
      )}
    </PressableScale>
  );
}