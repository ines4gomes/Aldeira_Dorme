import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, font, radius, spacing } from "@/src/theme";
import { Player } from "@/src/game/types";

interface Props {
  players: Player[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  contentPaddingBottom?: number;
}

// Mapeia a string da função para o ícone correspondente
const getRoleIcon = (role?: string) => {
  switch (role) {
    case "Lobo": return "paw";
    case "Caçador": return "bow-arrow";
    case "Profeta": return "eye";
    case "Dentista": return "tooth";
    case "Protetor": return "shield-half-full";
    default: return "account"; // Aldeão
  }
};

// Scrollable list of selectable (alive) players for narrator actions.
export default function PlayerPicker({
  players,
  selectedId,
  onSelect,
  contentPaddingBottom = 0,
}: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{
        gap: spacing.sm,
        paddingBottom: contentPaddingBottom,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {players.map((p) => {
        const selected = p.id === selectedId;
        return (
          <Pressable
            key={p.id}
            testID={`picker-player-${p.id}`}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onSelect(p.id);
            }}
            style={({ pressed }) => [
              styles.row,
              selected && styles.rowSelected,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.leftContent}>
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name={getRoleIcon(p.role)}
                  size={20}
                  color={colors.onSurface}
                />
              </View>
              <Text
                style={[styles.name, selected && styles.nameSelected]}
                numberOfLines={1}
              >
                {p.name}
              </Text>
            </View>

            {selected ? (
              <MaterialCommunityIcons
                name="check-circle"
                size={22}
                color={colors.gold}
              />
            ) : (
              <MaterialCommunityIcons
                name="circle-outline"
                size={22}
                color={colors.onSurfaceTertiary}
              />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 54,
  },
  rowSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.surfaceTertiary,
  },
  pressed: { opacity: 0.85 },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceTertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  name: { color: colors.onSurface, fontSize: font.lg, fontWeight: "600", flex: 1 },
  nameSelected: { color: colors.gold, fontWeight: "800" },
});
