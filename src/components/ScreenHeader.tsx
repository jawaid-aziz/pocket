import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, typography } from "../theme/tokens";

export function ScreenHeader({ title }: { title: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: insets.top + spacing(3),
        paddingHorizontal: spacing(4),
        paddingBottom: spacing(3),
      }}
    >
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.push("/(tabs)" as any))}
        hitSlop={10}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.surfaceAlt,
          alignItems: "center",
          justifyContent: "center",
          marginRight: spacing(3),
        }}
      >
        <ChevronLeft size={20} color={colors.textPrimary} />
      </Pressable>
      <Text style={{ ...typography.h2 }}>{title}</Text>
    </View>
  );
}