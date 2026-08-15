import * as Haptics from "expo-haptics";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors, font, radius, spacing } from "@/src/theme";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "gold" | "crimson" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  haptic?: Haptics.ImpactFeedbackStyle;
}

export default function PrimaryButton({
  label,
  onPress,
  variant = "gold",
  disabled,
  loading,
  testID,
  haptic = Haptics.ImpactFeedbackStyle.Medium,
}: Props) {
  const handle = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(haptic).catch(() => {});
    onPress();
  };

  const bg =
    variant === "gold"
      ? colors.gold
      : variant === "crimson"
        ? colors.crimson
        : "transparent";
  const fg =
    variant === "gold"
      ? colors.onGold
      : variant === "crimson"
        ? colors.onCrimson
        : colors.onSurface;

  return (
    <Pressable
      testID={testID}
      onPress={handle}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg },
        variant === "ghost" && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 54,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  ghost: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  label: {
    fontSize: font.lg,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
