import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { StyleSheet, Text, View } from "react-native";

import { colors, font, radius, spacing } from "@/src/theme";
import { ROLE_META } from "@/src/game/roles";
import { Role } from "@/src/game/types";

interface Props {
  name: string;
  role: Role;
  compact?: boolean;
}

// The glass role card shown privately to a player (and to the narrator on tap).
export default function RoleCard({ name, role, compact }: Props) {
  const meta = ROLE_META[role];
  return (
    <BlurView intensity={40} tint="dark" style={styles.card}>
      <View style={styles.inner}>
        <Text style={styles.playerName} testID="role-card-name">
          {name}
        </Text>
        <Text style={styles.subtitle}>O TEU PAPEL</Text>
        <View
          style={[
            styles.iconWrap,
            { borderColor: meta.color },
            compact && styles.iconWrapCompact,
          ]}
        >
          <MaterialCommunityIcons
            name={meta.icon as any}
            size={compact ? 48 : 84}
            color={meta.color}
          />
        </View>
        <Text
          style={[styles.roleName, compact && styles.roleNameCompact]}
          testID="role-card-role"
        >
          {role.toUpperCase()}
        </Text>
        <Text style={styles.tagline}>{meta.tagline}</Text>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    width: "100%",
  },
  inner: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
    paddingHorizontal: spacing.xl,
    backgroundColor: "rgba(23,23,30,0.35)",
  },
  playerName: {
    color: colors.gold,
    fontSize: font["2xl"],
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.onSurfaceTertiary,
    fontSize: font.sm,
    letterSpacing: 3,
    marginBottom: spacing.xl,
  },
  iconWrap: {
    width: 140,
    height: 140,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    backgroundColor: "rgba(9,9,12,0.4)",
  },
  iconWrapCompact: { width: 84, height: 84, marginBottom: spacing.md },
  roleName: {
    color: colors.onSurface,
    fontSize: font["3xl"],
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  roleNameCompact: { fontSize: font["2xl"], marginBottom: spacing.sm },
  tagline: {
    color: colors.onSurfaceSecondary,
    fontSize: font.base,
    textAlign: "center",
    lineHeight: 20,
  },
});
