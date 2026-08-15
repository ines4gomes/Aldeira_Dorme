import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameBackground from "@/src/components/GameBackground";
import PrimaryButton from "@/src/components/PrimaryButton";
import RoleCard from "@/src/components/RoleCard";
import { useGame } from "@/src/game/GameContext";
import { Role } from "@/src/game/types";
import { colors, font, radius, spacing } from "@/src/theme";

type Phase = "pass" | "input" | "reveal";

export default function Deal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, assignNext } = useGame();

  const [phase, setPhase] = useState<Phase>("pass");
  const [name, setName] = useState("");
  const [revealed, setRevealed] = useState<{
    name: string;
    role: Role;
    number: number;
  } | null>(null);

  const currentNumber = state.dealtCount + 1;
  const total = state.playerCount;

  const goInput = () => setPhase("input");

  const confirmName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const res = assignNext(trimmed);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    setRevealed({ ...res, number: currentNumber });
    setPhase("reveal");
  };

  const hideCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    const isLast = (revealed?.number ?? 0) >= total;
    setName("");
    setRevealed(null);
    if (isLast) {
      router.replace("/dashboard");
    } else {
      setPhase("pass");
    }
  };

  return (
    <GameBackground variant="forest">
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.progress} testID="deal-progress">
          Jogador {Math.min(currentNumber, total)} de {total}
        </Text>

        {phase === "pass" && (
          <View style={styles.centered}>
            <MaterialCommunityIcons
              name="cellphone-arrow-down"
              size={72}
              color={colors.gold}
            />
            <Text style={styles.bigTitle}>Passa o telemóvel</Text>
            <Text style={styles.bodyText}>
              Entrega o telemóvel ao próximo jogador. Só tu podes ver a tua
              carta.
            </Text>
            <View style={styles.ctaWrap}>
              <PrimaryButton
                label="Estou pronto"
                onPress={goInput}
                testID="ready-button"
              />
            </View>
          </View>
        )}

        {phase === "input" && (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={insets.top + 20}
          >
            <View style={styles.centered}>
              <Text style={styles.bigTitle}>Qual é o teu nome?</Text>
              <TextInput
                testID="name-input"
                value={name}
                onChangeText={setName}
                placeholder="Escreve o teu nome"
                placeholderTextColor={colors.onSurfaceTertiary}
                style={styles.input}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={confirmName}
                maxLength={20}
              />
              <View style={styles.ctaWrap}>
                <PrimaryButton
                  label="Ver Carta"
                  onPress={confirmName}
                  disabled={!name.trim()}
                  testID="see-card-button"
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        )}

        {phase === "reveal" && revealed && (
          <View style={styles.revealContainer}>
            <View style={styles.revealCard}>
              <RoleCard name={revealed.name} role={revealed.role} />
            </View>
            <View style={[styles.ctaWrap, { marginBottom: insets.bottom + spacing.md }]}>
              <Text style={styles.hideHint}>
                Memoriza a tua carta em segredo, depois esconde-a.
              </Text>
              <PrimaryButton
                label="ESCONDER CARTA"
                onPress={hideCard}
                variant="crimson"
                testID="hide-card-button"
              />
            </View>
          </View>
        )}
      </View>
    </GameBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: spacing.xl },
  progress: {
    color: colors.onSurfaceTertiary,
    fontSize: font.sm,
    letterSpacing: 2,
    textAlign: "center",
    textTransform: "uppercase",
  },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  bigTitle: {
    color: colors.onSurface,
    fontSize: font["3xl"],
    fontWeight: "900",
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  bodyText: {
    color: colors.onSurfaceSecondary,
    fontSize: font.lg,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  input: {
    width: "100%",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    color: colors.onSurface,
    fontSize: font.xl,
    fontWeight: "600",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  ctaWrap: { width: "100%", marginTop: spacing.xl },
  revealContainer: { flex: 1, justifyContent: "center" },
  revealCard: { marginBottom: spacing.xl },
  hideHint: {
    color: colors.onSurfaceSecondary,
    fontSize: font.base,
    textAlign: "center",
    marginBottom: spacing.md,
  },
});
