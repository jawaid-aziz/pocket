import { View } from "react-native";

interface PinDotsProps {
  length: number;
  filled: number;
  error?: boolean;
}

export default function PinDots({ length, filled, error }: PinDotsProps) {
  return (
    <View className="flex-row gap-4 justify-center my-8">
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          className={`w-4 h-4 rounded-full border-2 ${
            error
              ? "border-red-400 bg-red-400"
              : i < filled
                ? "border-accent bg-accent"
                : "border-gray-500 bg-transparent"
          }`}
        />
      ))}
    </View>
  );
}
