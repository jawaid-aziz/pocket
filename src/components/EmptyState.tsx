import { View, Text } from "react-native";
import { colors, spacing, typography } from "../theme/tokens";

interface EmptyStateProps {
  icon: React.ComponentType<any>;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems: "center",
        paddingVertical: spacing(8),
        paddingHorizontal: spacing(6),
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: spacing(3),
        }}
      >
        <Icon size={26} color={colors.primary} />
      </View>
      <Text style={{ ...typography.bodyStrong, textAlign: "center" }}>{title}</Text>
      {subtitle ? (
        <Text
          style={{
            ...typography.caption,
            textAlign: "center",
            marginTop: 4,
            lineHeight: 18,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: spacing(4) }}>{action}</View> : null}
    </View>
  );
}