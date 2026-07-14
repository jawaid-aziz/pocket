import { View } from "react-native";
import { colors } from "@/src/theme/tokens";

interface PinDotsProps {
  length: number;
  filled: number;
  error?: boolean;
}

export default function PinDots({ length, filled, error }: PinDotsProps) {
  return (
    <View style={{ flexDirection: "row", gap: 16, justifyContent: "center", marginVertical: 32 }}>
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
    </View>
  );
}