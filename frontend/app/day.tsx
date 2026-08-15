import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameBackground from "@/src/components/GameBackground";
import PlayerPicker from "@/src/components/PlayerPicker";
import PrimaryButton from "@/src/components/PrimaryButton";
import { useGame } from "@/src/game/GameContext";
import { colors, font, radius, spacing } from "@/src/theme";

export default function Day() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, confirmVote } = useGame();

  const [phase, setPhase] = useState<"summary" | "vote">("summary");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const night = state.nights[state.currentNight - 1];
  const alive = state.players.filter((p) => p.alive);
  const silencedName = night?.silencedId
    ? state.players.find((p) => p.id === night.silencedId)?.name
    : null;
  const deadThisNight = (night?.deaths ?? [])
    .map((id) => state.players.find((p) => p.id === id)?.name)
    .filter(Boolean) as string[];

  useEffect(() => {
    if (state.status === "dashboard") router.replace("/dashboard");
    else if (state.status === "finished") router.replace("/win");
  }, [state.status, router]);

  const vote = () => {
    if (!selectedId) return;
    confirmVote(selectedId);
  };

  if (phase === "summary") {
    return (
      <GameBackground variant="moon">
        <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.headerCentered}>
            <MaterialCommunityIcons name="weather-sunset-up" size={56} color={colors.gold} />
            <Text style={styles.title}>A ALDEIA{"\n"}ACORDA</Text>
            <Text style={styles.subtitle}>Noite {state.currentNight}</Text>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={{ paddingBottom: 40, gap: spacing.sm }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionLabel}>O que aconteceu esta noite</Text>
            {(night?.summary ?? []).map((line, i) => (
              <View key={i} style={styles.summaryRow}>
                <MaterialCommunityIcons
                  name="circle-medium"
                  size={22}
                  color={colors.gold}
                />
                <Text style={styles.summaryText}>{line}</Text>
              </View>
            ))}

            {deadThisNight.length > 0 && (
              <View style={styles.deathBox}>
                <MaterialCommunityIcons name="skull" size={24} color={colors.error} />
                <Text style={styles.deathText}>
                  Morreu{deadThisNight.length > 1 ? "ram" : ""}:{" "}
                  {deadThisNight.join(", ")}
                </Text>
              </View>
            )}

            {silencedName && (
              <View style={styles.silenceBox}>
                <MaterialCommunityIcons name="account-voice-off" size={22} color={colors.warning} />
                <Text style={styles.silenceText}>
                  {silencedName} está calado nesta ronda — não pode falar na
                  discussão.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
            <PrimaryButton
              label="Continuar para a votação"
              onPress={() => setPhase("vote")}
              testID="go-vote-button"
            />
          </View>
        </View>
      </GameBackground>
    );
  }

  return (
    <GameBackground variant="moon">
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerCentered}>
          <MaterialCommunityIcons name="gavel" size={48} color={colors.gold} />
          <Text style={styles.title}>A ALDEIA VOTA</Text>
          <Text style={styles.subtitle}>
            Depois da discussão, escolhe quem a aldeia elimina.
          </Text>
          {silencedName && (
            <Text style={styles.silenceInline}>
              Lembra-te: {silencedName} está calado nesta ronda.
            </Text>
          )}
        </View>

        <View style={styles.flex}>
          <PlayerPicker
            players={alive}
            selectedId={selectedId}
            onSelect={setSelectedId}
            contentPaddingBottom={spacing.md}
          />
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <PrimaryButton
            label="Confirmar Eliminação"
            onPress={vote}
            variant="crimson"
            disabled={!selectedId}
            testID="confirm-vote-button"
          />
        </View>
      </View>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: spacing.xl },
  headerCentered: { alignItems: "center", marginBottom: spacing.lg },
  title: {
    color: colors.onSurface,
    fontSize: font["3xl"],
    fontWeight: "900",
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 36,
  },
  subtitle: {
    color: colors.onSurfaceSecondary,
    fontSize: font.base,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    lineHeight: 20,
  },
  sectionLabel: {
    color: colors.onSurfaceTertiary,
    fontSize: font.sm,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  summaryText: { color: colors.onSurface, fontSize: font.base, flex: 1, lineHeight: 20 },
  deathBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(211,47,47,0.14)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(211,47,47,0.4)",
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  deathText: { color: colors.onSurface, fontSize: font.lg, fontWeight: "700", flex: 1 },
  silenceBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(245,127,23,0.12)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(245,127,23,0.4)",
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  silenceText: { color: colors.onSurface, fontSize: font.base, flex: 1, lineHeight: 20 },
  silenceInline: {
    color: colors.warning,
    fontSize: font.sm,
    textAlign: "center",
    marginTop: spacing.sm,
    fontWeight: "600",
  },
  footer: { paddingTop: spacing.md },
});
