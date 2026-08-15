import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameBackground from "@/src/components/GameBackground";
import PrimaryButton from "@/src/components/PrimaryButton";
import { useGame } from "@/src/game/GameContext";
import { ROLE_META, compositionSummary } from "@/src/game/roles";
import { GameStatus } from "@/src/game/types";
import { colors, font, radius, spacing } from "@/src/theme";

const MIN = 3;
const MAX = 30;

const routeFor: Record<GameStatus, string> = {
  setup: "/",
  dealing: "/deal",
  dashboard: "/dashboard",
  night: "/night",
  day: "/day",
  finished: "/win",
};

export default function Setup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, ready, startGame } = useGame();
  const [count, setCount] = useState(8);
  const redirected = useRef(false);

  // Resume an in-progress game after an accidental exit / reload.
  useEffect(() => {
    if (!ready || redirected.current) return;
    if (state.status !== "setup") {
      redirected.current = true;
      router.replace(routeFor[state.status] as any);
    }
  }, [ready, state.status, router]);

  const preview = compositionSummary(count);

  const start = () => {
    startGame(count);
    router.replace("/deal");
  };

  const dec = () => setCount((c) => Math.max(MIN, c - 1));
  const inc = () => setCount((c) => Math.min(MAX, c + 1));

  return (
    <GameBackground variant="moon">
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="paw" size={44} color={colors.gold} />
          <Text style={styles.kicker}>O JOGO DA</Text>
          <Text style={styles.title}>Aldeia{"\n"}Dorme</Text>
          <Text style={styles.subtitle}>
            Distribui os papéis e guia o narrador do início ao fim.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Quantos jogadores?</Text>
          <View style={styles.stepperRow}>
            <Pressable
              testID="count-decrease"
              onPress={dec}
              style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="minus" size={30} color={colors.onSurface} />
            </Pressable>
            <View style={styles.countBox}>
              <Text style={styles.countValue} testID="player-count-value">
                {count}
              </Text>
              <Text style={styles.countHint}>{MIN}–{MAX} jogadores</Text>
            </View>
            <Pressable
              testID="count-increase"
              onPress={inc}
              style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="plus" size={30} color={colors.onSurface} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Personagens desta partida</Text>
        <View style={styles.previewList}>
          {preview.map((row) => {
            const meta = ROLE_META[row.role];
            return (
              <View key={row.role} style={styles.previewRow}>
                <MaterialCommunityIcons
                  name={meta.icon as any}
                  size={22}
                  color={meta.color}
                />
                <Text style={styles.previewName}>{row.role}</Text>
                <Text style={styles.previewCount}>×{row.count}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label="Iniciar Jogo"
          onPress={start}
          testID="start-game-button"
        />
      </View>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl },
  header: { alignItems: "center", marginBottom: spacing["2xl"] },
  kicker: {
    color: colors.onSurfaceTertiary,
    letterSpacing: 6,
    fontSize: font.sm,
    marginTop: spacing.md,
  },
  title: {
    color: colors.onSurface,
    fontSize: 56,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 56,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: colors.onSurfaceSecondary,
    fontSize: font.base,
    textAlign: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  cardLabel: {
    color: colors.onSurfaceSecondary,
    fontSize: font.base,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepBtn: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  countBox: { alignItems: "center" },
  countValue: { color: colors.gold, fontSize: 64, fontWeight: "900", lineHeight: 68 },
  countHint: { color: colors.onSurfaceTertiary, fontSize: font.sm },
  pressed: { opacity: 0.7 },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: font.xl,
    fontWeight: "800",
    marginBottom: spacing.md,
  },
  previewList: { gap: spacing.sm },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  previewName: { color: colors.onSurface, fontSize: font.lg, fontWeight: "600", flex: 1 },
  previewCount: { color: colors.gold, fontSize: font.lg, fontWeight: "800" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: "rgba(9,9,12,0.9)",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
