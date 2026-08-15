import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameBackground from "@/src/components/GameBackground";
import PrimaryButton from "@/src/components/PrimaryButton";
import RoleCard from "@/src/components/RoleCard";
import { useGame } from "@/src/game/GameContext";
import { ROLE_META } from "@/src/game/roles";
import { Player } from "@/src/game/types";
import { colors, font, radius, spacing } from "@/src/theme";

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, startNight, resetGame } = useGame();
  const [selected, setSelected] = useState<Player | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const alive = state.players.filter((p) => p.alive);
  const dead = state.players.filter((p) => !p.alive);
  const sorted = [...state.players].sort(
    (a, b) => Number(b.alive) - Number(a.alive),
  );
  const nextNight = state.currentNight + 1;

  const begin = () => {
    startNight();
    router.replace("/night");
  };

  const endGame = () => {
    resetGame();
    router.replace("/");
  };

  return (
    <GameBackground variant="solid">
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.flex}>
          <Text style={styles.kicker}>NARRADOR</Text>
          <Text style={styles.title}>Jogadores</Text>
        </View>
        <Pressable
          testID="end-game-button"
          onPress={() => setConfirmEnd(true)}
          style={({ pressed }) => [styles.endBtn, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="flag-checkered" size={22} color={colors.onSurfaceSecondary} />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <MaterialCommunityIcons name="heart-pulse" size={16} color={colors.success} />
          <Text style={styles.statText}>{alive.length} vivos</Text>
        </View>
        <View style={styles.statPill}>
          <MaterialCommunityIcons name="skull" size={16} color={colors.error} />
          <Text style={styles.statText}>{dead.length} mortos</Text>
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingBottom: 140,
          gap: spacing.sm,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hint}>
          Toca num jogador para ver a carta (caso alguém se esqueça do seu papel).
        </Text>
        {sorted.map((p) => {
          const meta = ROLE_META[p.role];
          return (
            <Pressable
              key={p.id}
              testID={`dashboard-player-${p.id}`}
              onPress={() => setSelected(p)}
              style={({ pressed }) => [
                styles.row,
                !p.alive && styles.rowDead,
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons
                name={meta.icon as any}
                size={24}
                color={p.alive ? meta.color : colors.onSurfaceTertiary}
              />
              <View style={styles.flex}>
                <Text
                  style={[styles.playerName, !p.alive && styles.deadText]}
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
                <Text style={[styles.roleText, !p.alive && styles.deadSub]}>
                  {p.role}
                  {!p.alive && p.deathCause ? ` · ${p.deathCause} (noite ${p.deathNight})` : ""}
                </Text>
              </View>
              {p.alive ? (
                <View style={styles.aliveBadge}>
                  <Text style={styles.aliveBadgeText}>VIVO</Text>
                </View>
              ) : (
                <MaterialCommunityIcons name="skull" size={20} color={colors.error} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label={`Iniciar Noite ${nextNight}`}
          onPress={begin}
          testID="start-night-button"
        />
      </View>

      {/* Role reveal modal */}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {selected && (
              <RoleCard name={selected.name} role={selected.role} compact />
            )}
            <View style={{ marginTop: spacing.lg }}>
              <PrimaryButton
                label="Fechar"
                variant="ghost"
                onPress={() => setSelected(null)}
                testID="close-reveal-button"
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* End game confirm modal */}
      <Modal
        visible={confirmEnd}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmEnd(false)}
      >
        <View style={styles.modalBackdrop}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.confirmCard}>
            <MaterialCommunityIcons name="alert" size={40} color={colors.warning} />
            <Text style={styles.confirmTitle}>Terminar o jogo?</Text>
            <Text style={styles.confirmBody}>
              Isto apaga a partida atual e todos os dados. Não é reversível.
            </Text>
            <View style={{ width: "100%", gap: spacing.sm, marginTop: spacing.lg }}>
              <PrimaryButton
                label="Terminar e limpar"
                variant="crimson"
                onPress={endGame}
                testID="confirm-end-button"
              />
              <PrimaryButton
                label="Cancelar"
                variant="ghost"
                onPress={() => setConfirmEnd(false)}
                testID="cancel-end-button"
              />
            </View>
          </View>
        </View>
      </Modal>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  kicker: { color: colors.gold, letterSpacing: 4, fontSize: font.sm },
  title: { color: colors.onSurface, fontSize: font["3xl"], fontWeight: "900" },
  endBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  statText: { color: colors.onSurfaceSecondary, fontSize: font.sm, fontWeight: "600" },
  hint: {
    color: colors.onSurfaceTertiary,
    fontSize: font.sm,
    marginBottom: spacing.xs,
    lineHeight: 18,
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
    minHeight: 60,
  },
  rowDead: { opacity: 0.55, backgroundColor: "transparent" },
  pressed: { opacity: 0.75 },
  playerName: { color: colors.onSurface, fontSize: font.lg, fontWeight: "700" },
  deadText: { textDecorationLine: "line-through", color: colors.onSurfaceTertiary },
  roleText: { color: colors.onSurfaceSecondary, fontSize: font.sm, marginTop: 2 },
  deadSub: { color: colors.onSurfaceTertiary },
  aliveBadge: {
    backgroundColor: "rgba(46,125,50,0.2)",
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
  },
  aliveBadgeText: { color: colors.success, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: "rgba(9,9,12,0.92)",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: { width: "100%", maxWidth: 400 },
  confirmCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
    alignItems: "center",
  },
  confirmTitle: {
    color: colors.onSurface,
    fontSize: font.xl,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  confirmBody: {
    color: colors.onSurfaceSecondary,
    fontSize: font.base,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});
