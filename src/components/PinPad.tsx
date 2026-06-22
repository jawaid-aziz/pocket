import { View, Text, TouchableOpacity } from 'react-native';

interface PinPadProps {
  onPress: (digit: string) => void;
  onDelete: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export default function PinPad({ onPress, onDelete }: PinPadProps) {
  return (
    <View className="w-full px-8">
      {[0, 1, 2, 3].map((row) => (
        <View key={row} className="flex-row justify-between mb-4">
          {KEYS.slice(row * 3, row * 3 + 3).map((key, i) => {
            if (key === '') {
              return <View key={i} className="w-20 h-14" />;
            }
            return (
              <TouchableOpacity
                key={i}
                className="w-20 h-14 rounded-2xl bg-white/10 items-center justify-center active:bg-white/20"
                onPress={() => (key === '⌫' ? onDelete() : onPress(key))}
              >
                <Text className="text-white text-2xl font-medium">{key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}