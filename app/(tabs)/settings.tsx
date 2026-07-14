import { View, Text, TextInput, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/src/store/authStore";
import { useMe, useUpdateProfile } from "@/src/api/hooks/useAccount";
import { useState } from "react";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { colors, spacing, typography } from "@/src/theme/tokens";

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
        onSuccess: () => setEditing(false),
        onError: () => {},
      },
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: spacing(6), paddingTop: spacing(6) }}>
        <Text style={{ ...typography.h1, fontSize: 22, marginBottom: spacing(6) }}>Settings</Text>

        {/* Avatar */}
        <View style={{ alignItems: "center", marginBottom: spacing(8) }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing(3),
            }}
          >
            <Text style={{ color: colors.primary, fontWeight: "800", fontSize: 30 }}>
              {(user?.name || user?.phone || "U")[0].toUpperCase()}
            </Text>
          </View>
          <Text style={{ fontSize: 17, fontWeight: "700", color: colors.textPrimary }}>
            {user?.name || "—"}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{user?.phone}</Text>
        </View>

        {/* Fields */}
        <Card>
          <View style={{ gap: spacing(4) }}>
            <View>
              <Text style={{ ...typography.caption, marginBottom: 4 }}>Full Name</Text>
              <TextInput
                style={{
                  fontSize: 15,
                  color: colors.textPrimary,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  paddingVertical: 8,
                }}
                value={name}
                onChangeText={setName}
                editable={editing}
                placeholderTextColor={colors.textTertiary}
                placeholder="Enter your name"
              />
            </View>

            <View>
              <Text style={{ ...typography.caption, marginBottom: 4 }}>Email</Text>
              <TextInput
                style={{
                  fontSize: 15,
                  color: colors.textPrimary,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  paddingVertical: 8,
                }}
                value={email}
                onChangeText={setEmail}
                editable={editing}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textTertiary}
                placeholder="Enter your email"
              />
            </View>

            <View>
              <Text style={{ ...typography.caption, marginBottom: 4 }}>Phone</Text>
              <Text style={{ fontSize: 15, color: colors.textPrimary, paddingVertical: 8 }}>
                {user?.phone}
              </Text>
            </View>
          </View>
        </Card>

        {editing ? (
          <View style={{ flexDirection: "row", gap: 12, marginTop: spacing(6) }}>
            <View style={{ flex: 1 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setEditing(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Save" onPress={handleSave} loading={isPending} />
            </View>
          </View>
        ) : (
          <View style={{ marginTop: spacing(6) }}>
            <Button label="Edit Profile" onPress={() => setEditing(true)} />
          </View>
        )}
      </View>
    </View>
  );
}