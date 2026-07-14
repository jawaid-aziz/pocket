import { View, Text, Pressable } from "react-native";
import { colors, radius } from "@/src/theme/tokens";

interface PinPadProps {
  onPress: (digit: string) => void;
  onDelete: () => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function PinPad({ onPress, onDelete }: PinPadProps) {
  return (
    <View style={{ width: "100%", maxWidth: 300, alignSelf: "center", paddingHorizontal: 16 }}>
      {[0, 1, 2, 3].map((row) => (
        <View key={row} style={{ flexDirection: "row", marginBottom: 16 }}>
          {KEYS.slice(row * 3, row * 3 + 3).map((key, i) => (
            <View key={i} style={{ flex: 1, alignItems: "center" }}>
              {key === "" ? (
                <View style={{ width: 64, height: 56 }} />
              ) : (
                <Pressable
                  onPress={() => (key === "⌫" ? onDelete() : onPress(key))}
                  style={({ pressed }) => ({
                    width: 64,
                    height: 56,
                    borderRadius: radius.md,
                    backgroundColor: pressed ? colors.primarySoftStrong : colors.surfaceAlt,
                    alignItems: "center",
                    justifyContent: "center",
                  })}
                >
                  <Text style={{ fontSize: 22, fontWeight: "600", color: colors.textPrimary }}>{key}</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}