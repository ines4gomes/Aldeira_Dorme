import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameBackground from "@/src/components/GameBackground";
import PlayerPicker from "@/src/components/PlayerPicker";
import PrimaryButton from "@/src/components/PrimaryButton";
import RoleCard from "@/src/components/RoleCard";
import { useGame } from "@/src/game/GameContext";
import { playSound } from "@/src/game/sounds";
import { colors, font, radius, spacing } from "@/src/theme";

export default function Day() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, confirmVote } = useGame();

  const [phase, setPhase] = useState<"summary" | "vote" | "voteReveal">(
    "summary",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const night = state.nights[state.currentNight - 1];
  const alive = state.players.filter((p) => p.alive);
  const silencedName = night?.silencedId
    ? state.players.find((p) => p.id === night.silencedId)?.name
    : null;
  const deadPlayersNight = (night?.deaths ?? [])
    .map((id) => state.players.find((p) => p.id === id))
    .filter(Boolean) as typeof state.players;
  const deadThisNight = deadPlayersNight.map((p) => p.name);

  const wolfKilled =
    !!night?.wolvesTarget && (night?.deaths ?? []).includes(night.wolvesTarget);
  const gunKilled = !!night?.hunterChoices.some(
    (hc) =>
      hc.wasWolf && hc.targetId && (night?.deaths ?? []).includes(hc.targetId),
  );

  useEffect(() => {
    if (state.status === "dashboard") router.replace("/dashboard");
    else if (state.status === "finished") router.replace("/win");
  }, [state.status, router]);

  useEffect(() => {
    if (phase !== "summary") return;
    if (wolfKilled) playSound("wolf");
    if (gunKilled) {
      const t = setTimeout(() => playSound("gun"), 1300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const voted = state.players.find((p) => p.id === selectedId) || null;
  const votedTwin =
    voted?.twinId
      ? state.players.find((p) => p.id === voted.twinId && p.alive) || null
      : null;

  const vote = () => {
    if (!selectedId) return;
    playSound("crowd");
    setPhase("voteReveal");
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

            {deadPlayersNight.map((p) => (
              <View key={p.id} style={styles.revealCardWrap}>
                <RoleCard name={p.name} role={p.role} compact />
              </View>
            ))}

            {silencedName && (
              <View style={styles.silenceBox}>
                <MaterialCommunityIcons name="account-voice-off" size={22} color={colors.gold} />
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

  if (phase === "voteReveal") {
    return (
      <GameBackground variant="moon">
        <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.headerCentered}>
            <MaterialCommunityIcons name="account-group" size={52} color={colors.crimson} />
            <Text style={styles.title}>{voted?.name}{"\n"}foi eliminado</Text>
            <Text style={styles.subtitle}>
              A aldeia gritou e decidiu. E afinal, o que era {voted?.name}?
            </Text>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={{ paddingBottom: 40, gap: spacing.lg }}
            showsVerticalScrollIndicator={false}
          >
            {voted && <RoleCard name={voted.name} role={voted.role} compact />}
            {votedTwin && (
              <>
                <Text style={styles.twinNote}>
                  E como {voted?.name} e {votedTwin.name} eram Gémeos, ao perder
                  um... {votedTwin.name} também partiu. Morreram os dois.
                </Text>
                <RoleCard name={votedTwin.name} role={votedTwin.role} compact />
              </>
            )}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
            <PrimaryButton
              label="Continuar"
              onPress={() => selectedId && confirmVote(selectedId)}
              testID="continue-after-vote-button"
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
    backgroundColor: "rgba(212,175,55,0.12)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.4)",
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  silenceText: { color: colors.onSurface, fontSize: font.base, flex: 1, lineHeight: 20 },
  silenceInline: {
    color: colors.gold,
    fontSize: font.sm,
    textAlign: "center",
    marginTop: spacing.sm,
    fontWeight: "600",
  },
  revealCardWrap: { marginTop: spacing.sm },
  twinNote: {
    color: colors.onSurfaceSecondary,
    fontSize: font.base,
    textAlign: "center",
    lineHeight: 20,
  },
  footer: { paddingTop: spacing.md },
});
