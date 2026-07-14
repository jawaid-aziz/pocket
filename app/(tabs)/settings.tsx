import { View, Text, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { useAuthStore } from "@/src/store/authStore";
import { useMe, useUpdateProfile } from "@/src/api/hooks/useAccount";
import { useState } from "react";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { colors, spacing, typography } from "@/src/theme/tokens";

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const { isLoading } = useMe();
  const { mutate: update, isPending } = useUpdateProfile();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleSave() {
    setSaveError(null);
    update(
      { name, email },
      {
        onSuccess: () => setEditing(false),
        onError: () => setSaveError("Could not update profile. Please try again."),
      },
    );
  }

  function handleCancel() {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setSaveError(null);
    setEditing(false);
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Settings" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing(6), paddingBottom: spacing(10) }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={{ alignItems: "center", marginBottom: spacing(8), marginTop: spacing(2) }}>
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
                  color: editing ? colors.textPrimary : colors.textSecondary,
                  borderBottomWidth: 1,
                  borderBottomColor: editing ? colors.primary : colors.border,
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
                  color: editing ? colors.textPrimary : colors.textSecondary,
                  borderBottomWidth: 1,
                  borderBottomColor: editing ? colors.primary : colors.border,
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
              <Text style={{ fontSize: 15, color: colors.textSecondary, paddingVertical: 8 }}>
                {user?.phone}
              </Text>
            </View>
          </View>
        </Card>

        {saveError && (
          <Text style={{ color: colors.danger, fontSize: 12, marginTop: spacing(3) }}>{saveError}</Text>
        )}

        {editing ? (
          <View style={{ flexDirection: "row", gap: 12, marginTop: spacing(6) }}>
            <View style={{ flex: 1 }}>
              <Button label="Cancel" variant="secondary" onPress={handleCancel} disabled={isPending} />
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
      </ScrollView>
    </View>
  );
}