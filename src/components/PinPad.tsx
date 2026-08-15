import { View, Text } from "react-native";
import { colors, radius } from "@/src/theme/tokens";
import { PressableScale } from "@/src/components/PressableScale";

interface PinPadProps {
  onPress: (digit: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

function PinKey({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <PressableScale
      onPress={onPress}
      haptic
      disabled={disabled}
      style={{
        width: 64,
        height: 56,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceAlt,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "600", color: colors.textPrimary }}>{label}</Text>
    </PressableScale>
  );
}

export default function PinPad({ onPress, onDelete, disabled }: PinPadProps) {
  return (
    <View style={{ width: "100%", maxWidth: 300, alignSelf: "center", paddingHorizontal: 16 }}>
      {[0, 1, 2, 3].map((row) => (
        <View key={row} style={{ flexDirection: "row", marginBottom: 16 }}>
          {KEYS.slice(row * 3, row * 3 + 3).map((key, i) => (
            <View key={i} style={{ flex: 1, alignItems: "center" }}>
              {key === "" ? (
                <View style={{ width: 64, height: 56 }} />
              ) : (
                <PinKey
                  label={key}
                  disabled={disabled}
                  onPress={() => {
                    if (key === "⌫") onDelete();
                    else onPress(key);
                  }}
                />
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}