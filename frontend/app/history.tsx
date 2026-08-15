import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameBackground from "@/src/components/GameBackground";
import { useGame } from "@/src/game/GameContext";
import { colors, font, radius, spacing } from "@/src/theme";

export default function History() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state } = useGame();

  const nameOf = (id: string | null) =>
    state.players.find((p) => p.id === id)?.name ?? "—";

  return (
    <GameBackground variant="solid">
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          testID="history-back-button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.onSurface} />
        </Pressable>
        <View style={styles.flex}>
          <Text style={styles.kicker}>REGISTO DA PARTIDA</Text>
          <Text style={styles.title}>Histórico</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingBottom: insets.bottom + 40,
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {state.nights.length === 0 && (
          <Text style={styles.empty}>Ainda não há noites registadas.</Text>
        )}
        {state.nights.map((n) => (
          <View key={n.night} style={styles.card}>
            <Text style={styles.nightTitle}>NOITE {n.night}</Text>

            <Line icon="target" label="Lobos escolheram" value={nameOf(n.wolvesTarget)} />

            {n.hunterChoices.map((hc, i) => (
              <Line
                key={i}
                icon="bow-arrow"
                label={`Caçador ${n.hunterChoices.length > 1 ? i + 1 : ""}`.trim()}
                value={`${nameOf(hc.targetId)} — ${hc.wasWolf ? "era Lobo" : "não era Lobo"}`}
              />
            ))}

            {n.profetaTarget && (
              <Line
                icon="eye"
                label="Profeta investigou"
                value={`${nameOf(n.profetaTarget)} — ${n.profetaIsWolf ? "acertou" : "falhou"}`}
              />
            )}
            {n.dentistaTarget && (
              <Line icon="tooth" label="Dentista calou" value={nameOf(n.dentistaTarget)} />
            )}
            {n.protetorTarget && (
              <Line icon="shield-half-full" label="Protetor protegeu" value={nameOf(n.protetorTarget)} />
            )}

            <View style={styles.divider} />
            <Line
              icon="skull"
              label="Mortes da noite"
              value={n.deaths.length ? n.deaths.map(nameOf).join(", ") : "ninguém"}
              danger
            />
            <Line
              icon="gavel"
              label="Aldeia eliminou"
              value={n.villageVote ? nameOf(n.villageVote) : "—"}
              danger
            />
          </View>
        ))}
      </ScrollView>
    </GameBackground>
  );
}

function Line({
  icon,
  label,
  value,
  danger,
}: {
  icon: string;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <View style={styles.line}>
      <MaterialCommunityIcons
        name={icon as any}
        size={18}
        color={danger ? colors.error : colors.gold}
      />
      <Text style={styles.lineLabel}>{label}:</Text>
      <Text style={styles.lineValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  kicker: { color: colors.gold, letterSpacing: 3, fontSize: font.sm },
  title: { color: colors.onSurface, fontSize: font["2xl"], fontWeight: "900" },
  empty: { color: colors.onSurfaceTertiary, fontSize: font.base, marginTop: spacing.xl, textAlign: "center" },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  nightTitle: {
    color: colors.gold,
    fontSize: font.lg,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  line: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  lineLabel: { color: colors.onSurfaceSecondary, fontSize: font.base, fontWeight: "600" },
  lineValue: { color: colors.onSurface, fontSize: font.base, flex: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});
