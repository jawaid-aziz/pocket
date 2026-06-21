import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <Text className="text-white text-2xl font-bold">NativeWind is working 🎉</Text>
      <View className="mt-4 px-4 py-2 bg-accent rounded-full">
        <Text className="text-white font-medium">Pocket Wallet</Text>
      </View>
    </View>
  );
}