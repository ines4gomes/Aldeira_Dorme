import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameBackground from "@/src/components/GameBackground";
import PlayerPicker from "@/src/components/PlayerPicker";
import PrimaryButton from "@/src/components/PrimaryButton";
import { useGame } from "@/src/game/GameContext";
import { buildNightSteps } from "@/src/game/engine";
import { Player } from "@/src/game/types";
import { colors, font, radius, spacing } from "@/src/theme";

interface StepView {
  kind: string;
  title: string;
  subtitle?: string;
  instruction: string;
  icon: string;
  pool: Player[];
  isProfeta: boolean;
}

export default function Night() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, confirmStep } = useGame();

  const [showIntro, setShowIntro] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const steps = useMemo(
    () => buildNightSteps(state.players),
    [state.players],
  );
  const alive = useMemo(
    () => state.players.filter((p) => p.alive),
    [state.players],
  );

  const idx = state.nightStepIndex;
  const step = steps[idx];

  // Reset per-step local state.
  useEffect(() => {
    setSelectedId(null);
    setShowResult(false);
  }, [idx]);

  // Navigate away once the night resolves.
  useEffect(() => {
    if (state.status === "day") router.replace("/day");
    else if (state.status === "finished") router.replace("/win");
  }, [state.status, router]);

  if (state.status !== "night" || !step) {
    return <GameBackground variant="forest">{null}</GameBackground>;
  }

  const nameOf = (id: string | null) =>
    state.players.find((p) => p.id === id)?.name ?? "";

  const view: StepView = ((): StepView => {
    switch (step.kind) {
      case "lobos":
        return {
          kind: "lobos",
          title: "OS LOBOS ACORDAM",
          instruction:
            "Os Lobos acordam e escolhem, em silêncio, quem querem matar. Seleciona a vítima.",
          icon: "paw",
          pool: alive,
          isProfeta: false,
        };
      case "cacador": {
        const hunter = state.players.find((p) => p.id === step.actorId);
        return {
          kind: "cacador",
          title: "O CAÇADOR ACORDA",
          subtitle: hunter ? `Caçador: ${hunter.name}` : undefined,
          instruction:
            "Aponta para uma pessoa que acredita ser Lobo. Se for Lobo, morre.",
          icon: "bow-arrow",
          pool: alive.filter((p) => p.id !== step.actorId),
          isProfeta: false,
        };
      }
      case "profeta": {
        const profeta = alive.find((p) => p.role === "Profeta");
        return {
          kind: "profeta",
          title: "O PROFETA ACORDA",
          instruction:
            "Aponta para uma pessoa para descobrir se é Lobo. O resultado será revelado a seguir.",
          icon: "eye",
          pool: alive.filter((p) => p.id !== profeta?.id),
          isProfeta: true,
        };
      }
      case "dentista": {
        const dentista = alive.find((p) => p.role === "Dentista");
        return {
          kind: "dentista",
          title: "O DENTISTA ACORDA",
          instruction:
            "Escolhe uma pessoa para ficar calada na ronda seguinte.",
          icon: "tooth",
          pool: alive.filter((p) => p.id !== dentista?.id),
          isProfeta: false,
        };
      }
      default: {
        return {
          kind: "protetor",
          title: "O PROTETOR ACORDA",
          instruction:
            "Escolhe quem queres proteger esta noite. Podes proteger-te a ti próprio.",
          icon: "shield-half-full",
          pool: alive,
          isProfeta: false,
        };
      }
    }
  })();

  const targetIsWolf =
    state.players.find((p) => p.id === selectedId)?.role === "Lobo";

  const advance = () => {
    if (!selectedId) return;
    Haptics.selectionAsync().catch(() => {});
    const total = steps.length;
    switch (step.kind) {
      case "lobos":
        confirmStep((c) => ({ ...c, wolvesTarget: selectedId }), total);
        break;
      case "cacador":
        confirmStep(
          (c) => ({
            ...c,
            hunterChoices: [
              ...c.hunterChoices,
              { hunterId: step.actorId!, targetId: selectedId, wasWolf: targetIsWolf },
            ],
          }),
          total,
        );
        break;
      case "profeta":
        confirmStep(
          (c) => ({
            ...c,
            profetaTarget: selectedId,
            profetaIsWolf: targetIsWolf,
          }),
          total,
        );
        break;
      case "dentista":
        confirmStep((c) => ({ ...c, dentistaTarget: selectedId }), total);
        break;
      default:
        confirmStep((c) => ({ ...c, protetorTarget: selectedId }), total);
    }
  };

  const onPrimary = () => {
    if (view.isProfeta && !showResult) {
      // reveal the profeta result before advancing
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
      setShowResult(true);
      return;
    }
    advance();
  };

  // ---- Intro ----
  if (showIntro && idx === 0) {
    return (
      <GameBackground variant="forest">
        <View style={[styles.introWrap, { paddingTop: insets.top }]}>
          <View style={styles.centered}>
            <MaterialCommunityIcons
              name="weather-night"
              size={72}
              color={colors.gold}
            />
            <Text style={styles.nightLabel}>NOITE {state.currentNight}</Text>
            <Text style={styles.introTitle}>A aldeia dorme...</Text>
            <Text style={styles.introBody}>
              Todos fecham os olhos. Vou guiar-te por cada personagem, uma de
              cada vez.
            </Text>
          </View>
          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
            <PrimaryButton
              label="Começar a noite"
              onPress={() => setShowIntro(false)}
              testID="start-night-steps-button"
            />
          </View>
        </View>
      </GameBackground>
    );
  }

  return (
    <GameBackground variant="forest">
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.progress}>
          Noite {state.currentNight} · Passo {idx + 1} de {steps.length}
        </Text>

        <View style={styles.stepHeader}>
          <View style={[styles.iconCircle, { borderColor: colors.gold }]}>
            <MaterialCommunityIcons name={view.icon as any} size={40} color={colors.gold} />
          </View>
          <Text style={styles.stepTitle}>{view.title}</Text>
          {view.subtitle ? <Text style={styles.stepSubtitle}>{view.subtitle}</Text> : null}
          <Text style={styles.instruction}>{view.instruction}</Text>
        </View>

        {view.isProfeta && showResult ? (
          <View style={styles.resultWrap}>
            <MaterialCommunityIcons
              name={targetIsWolf ? "paw" : "shield-check"}
              size={80}
              color={targetIsWolf ? colors.crimson : colors.success}
            />
            <Text style={styles.resultName}>{nameOf(selectedId)}</Text>
            <Text
              style={[
                styles.resultVerdict,
                { color: targetIsWolf ? colors.crimson : colors.success },
              ]}
              testID="profeta-result"
            >
              {targetIsWolf ? "É LOBO" : "NÃO É LOBO"}
            </Text>
            <Text style={styles.resultHint}>
              {targetIsWolf
                ? "O Profeta acertou! Transmite esta informação em segredo."
                : "O Profeta falhou. Transmite esta informação em segredo."}
            </Text>
          </View>
        ) : (
          <View style={styles.pickerWrap}>
            <PlayerPicker
              players={view.pool}
              selectedId={selectedId}
              onSelect={setSelectedId}
              contentPaddingBottom={spacing.md}
            />
          </View>
        )}

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <PrimaryButton
            label={
              view.isProfeta && !showResult
                ? "Revelar resultado"
                : "Confirmar"
            }
            onPress={onPrimary}
            disabled={!selectedId}
            testID="confirm-step-button"
          />
        </View>
      </View>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl },
  introWrap: { flex: 1, paddingHorizontal: spacing.xl },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  nightLabel: {
    color: colors.gold,
    letterSpacing: 6,
    fontSize: font.base,
    marginTop: spacing.lg,
  },
  introTitle: {
    color: colors.onSurface,
    fontSize: font["4xl"],
    fontWeight: "900",
    textAlign: "center",
    marginTop: spacing.sm,
  },
  introBody: {
    color: colors.onSurfaceSecondary,
    fontSize: font.lg,
    textAlign: "center",
    lineHeight: 24,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  progress: {
    color: colors.onSurfaceTertiary,
    fontSize: font.sm,
    letterSpacing: 1.5,
    textAlign: "center",
    textTransform: "uppercase",
  },
  stepHeader: { alignItems: "center", marginTop: spacing.lg, marginBottom: spacing.lg },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(9,9,12,0.5)",
    marginBottom: spacing.md,
  },
  stepTitle: {
    color: colors.onSurface,
    fontSize: font["2xl"],
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },
  stepSubtitle: {
    color: colors.gold,
    fontSize: font.base,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  instruction: {
    color: colors.onSurfaceSecondary,
    fontSize: font.base,
    textAlign: "center",
    lineHeight: 20,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  pickerWrap: { flex: 1 },
  resultWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  resultName: {
    color: colors.onSurface,
    fontSize: font.xl,
    fontWeight: "700",
    marginTop: spacing.lg,
  },
  resultVerdict: {
    fontSize: font["4xl"],
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  resultHint: {
    color: colors.onSurfaceSecondary,
    fontSize: font.base,
    textAlign: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
  footer: {
    paddingTop: spacing.md,
  },
});
