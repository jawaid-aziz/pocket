import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function SendScreen() {
  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <Text className="text-white text-xl mb-4">Send — coming soon</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text className="text-accent">← Back</Text>
      </TouchableOpacity>
    </View>
  );
}