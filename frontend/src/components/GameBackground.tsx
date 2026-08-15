import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { colors, images } from "@/src/theme";

interface Props {
  variant?: "moon" | "forest" | "solid";
  children: React.ReactNode;
}

// Full-bleed atmospheric background with a bottom gradient scrim for contrast.
export default function GameBackground({ variant = "solid", children }: Props) {
  const uri = variant === "moon" ? images.moon : variant === "forest" ? images.forest : null;
  return (
    <View style={styles.root}>
      {uri ? (
        <>
          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={400}
          />
          <LinearGradient
            colors={[
              "rgba(9,9,12,0.55)",
              "rgba(9,9,12,0.82)",
              "rgba(9,9,12,0.97)",
            ]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1 },
});
