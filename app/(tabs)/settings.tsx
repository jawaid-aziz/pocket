import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/src/store/authStore";
import { useMe, useUpdateProfile } from "@/src/api/hooks/useAccount";
import { useState } from "react";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { isLoading } = useMe();
  const { mutate: update, isPending } = useUpdateProfile();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [editing, setEditing] = useState(false);

  function handleSave() {
    update(
      { name, email },
      {
        onSuccess: () => {
          setEditing(false);
          Alert.alert("Saved", "Profile updated successfully");
        },
        onError: () => Alert.alert("Error", "Could not update profile"),
      }
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator color="#10B981" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-6">
        <Text className="text-white text-2xl font-bold mb-6">Settings</Text>

        {/* Avatar */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-accent/20 items-center justify-center mb-3">
            <Text className="text-accent font-bold text-3xl">
              {(user?.name || user?.phone || "U")[0].toUpperCase()}
            </Text>
          </View>
          <Text className="text-white text-lg font-semibold">{user?.name || "—"}</Text>
          <Text className="text-gray-400 text-sm">{user?.phone}</Text>
        </View>

        {/* Fields */}
        <View className="bg-white/5 rounded-2xl p-5 gap-4">
          <View>
            <Text className="text-gray-400 text-xs mb-1">Full Name</Text>
            <TextInput
              className="text-white text-base border-b border-white/10 py-2"
              value={name}
              onChangeText={setName}
              editable={editing}
              placeholderTextColor="#6B7280"
              placeholder="Enter your name"
            />
          </View>

          <View>
            <Text className="text-gray-400 text-xs mb-1">Email</Text>
            <TextInput
              className="text-white text-base border-b border-white/10 py-2"
              value={email}
              onChangeText={setEmail}
              editable={editing}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#6B7280"
              placeholder="Enter your email"
            />
          </View>

          <View>
            <Text className="text-gray-400 text-xs mb-1">Phone</Text>
            <Text className="text-white text-base py-2">{user?.phone}</Text>
          </View>
        </View>

        {/* Edit / Save button */}
        {editing ? (
          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity
              className="flex-1 bg-white/10 rounded-2xl py-4 items-center"
              onPress={() => setEditing(false)}
            >
              <Text className="text-white font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-accent rounded-2xl py-4 items-center"
              onPress={handleSave}
              disabled={isPending}
            >
              {isPending
                ? <ActivityIndicator color="#fff" />
                : <Text className="text-white font-semibold">Save</Text>
              }
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            className="mt-6 bg-accent rounded-2xl py-4 items-center"
            onPress={() => setEditing(true)}
          >
            <Text className="text-white font-semibold">Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}