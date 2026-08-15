import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, font, radius, spacing } from "@/src/theme";
import WolfIcon from "./WolfIcon";

// A prominent, dramatic note the narrator reads aloud (deaths, key events).
export default function BigNote({
  tone = "gold",
  icon,
  title,
  text,
}: {
  tone?: "gold" | "crimson";
  icon: string;
  title: string;
  text?: string;
}) {
  const c = tone === "crimson" ? colors.crimson : colors.gold;
  return (
    <View
      style={[
        styles.card,
        {
          borderColor: c,
          backgroundColor:
            tone === "crimson"
              ? "rgba(184,0,25,0.14)"
              : "rgba(212,175,55,0.12)",
        },
      ]}
    >
      {icon === "wolf" ? (
        <WolfIcon size={40} color={c} />
      ) : (
        <MaterialCommunityIcons name={icon as any} size={40} color={c} />
      )}
      <Text style={[styles.title, { color: c }]}>{title}</Text>
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: font["2xl"],
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  text: {
    color: colors.onSurface,
    fontSize: font.base,
    textAlign: "center",
    lineHeight: 20,
  },
});
