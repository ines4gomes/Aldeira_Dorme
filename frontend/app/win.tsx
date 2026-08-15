import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameBackground from "@/src/components/GameBackground";
import PrimaryButton from "@/src/components/PrimaryButton";
import RoleIcon from "@/src/components/RoleIcon";
import WolfIcon from "@/src/components/WolfIcon";
import { useGame } from "@/src/game/GameContext";
import { ROLE_META } from "@/src/game/roles";
import { colors, font, radius, spacing } from "@/src/theme";

export default function Win() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, resetGame } = useGame();

  const lobosWin = state.winner === "lobos";

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
  }, []);

  const newGame = () => {
    resetGame();
    router.replace("/");
  };

  return (
    <GameBackground variant="moon">
      <View style={[styles.container, { paddingTop: insets.top + spacing["2xl"] }]}>
        <View style={styles.headerCentered}>
          <MaterialCommunityIcons
            name={lobosWin ? "paw" : "home-heart"}
            size={80}
            color={lobosWin ? colors.crimson : colors.gold}
          />
          <Text style={styles.kicker}>FIM DE JOGO</Text>
          <Text
            style={[styles.title, { color: lobosWin ? colors.crimson : colors.gold }]}
            testID="winner-title"
          >
            {lobosWin ? "Os Lobos\nVencem" : "A Aldeia\nVence"}
          </Text>
          <Text style={styles.subtitle}>
            {lobosWin
              ? "A escuridão dominou a aldeia."
              : "Todos os Lobos foram eliminados."}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Papéis revelados</Text>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{ paddingBottom: 40, gap: spacing.sm }}
          showsVerticalScrollIndicator={false}
        >
          {state.players.map((p) => {
            const meta = ROLE_META[p.role];
            return (
              <View key={p.id} style={styles.row}>
                <RoleIcon role={p.role} size={22} color={meta.color} />
                <Text style={[styles.name, !p.alive && styles.dead]} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.role}>{p.role}</Text>
                {!p.alive && (
                  <MaterialCommunityIcons name="skull" size={18} color={colors.error} />
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <PrimaryButton label="Novo Jogo" onPress={newGame} testID="new-game-button" />
        </View>
      </View>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: spacing.xl },
  headerCentered: { alignItems: "center", marginBottom: spacing.xl },
  kicker: {
    color: colors.onSurfaceTertiary,
    letterSpacing: 6,
    fontSize: font.sm,
    marginTop: spacing.md,
  },
  title: {
    fontSize: 52,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 54,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: colors.onSurfaceSecondary,
    fontSize: font.lg,
    textAlign: "center",
    marginTop: spacing.md,
  },
  sectionLabel: {
    color: colors.onSurfaceTertiary,
    fontSize: font.sm,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  name: { color: colors.onSurface, fontSize: font.lg, fontWeight: "700", flex: 1 },
  dead: { textDecorationLine: "line-through", color: colors.onSurfaceTertiary },
  role: { color: colors.gold, fontSize: font.base, fontWeight: "600" },
  footer: { paddingTop: spacing.md },
});
