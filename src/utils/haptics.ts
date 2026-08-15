import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Central haptic feedback helpers. Web has no haptics — guard so the app
// never throws on non-native platforms.

export function tapFeedback() {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function selectionFeedback() {
  if (Platform.OS === "web") return;
  Haptics.selectionAsync().catch(() => {});
}

export function successFeedback() {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => {},
  );
}

export function errorFeedback() {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
    () => {},
  );
}