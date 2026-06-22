import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-primary items-center justify-center"
      style={{ paddingTop: insets.top }}>
      <Text className="text-white text-xl">Settings — coming soon</Text>
    </View>
  );
}