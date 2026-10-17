import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  hex: string;
  label?: string; // leave undefined to hide the color name
  state: "idle" | "correct" | "wrong";
  onPress: () => void;
};

export function ColorTile({ hex, label, state, onPress }: Props) {
  const { s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    tile: {
      minHeight: Math.max(96, s(120)),
      borderWidth: Math.max(4, s(4)),
      borderRadius: s(radius.lg),
      padding: s(spacing.sm),
    },
    gloss: {
      top: s(spacing.xs),
      left: s(spacing.sm),
      right: s(spacing.sm),
      borderRadius: s(radius.lg),
    },
    mark: { fontSize: s(40) },
  });

  const borderColor =
    state === "correct"
      ? colors.teal
      : state === "wrong"
        ? colors.pink
        : colors.cardBorder;

  return (
    <PressableScale
      onPress={onPress}
      disabled={state === "wrong"}
      style={[
        styles.tile,
        responsiveStyles.tile,
        {
          backgroundColor: hex,
          borderColor,
          opacity: state === "wrong" ? 0.45 : 1,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[styles.gloss, responsiveStyles.gloss]}
      />

      {state !== "idle" && (
        <View pointerEvents="none" style={styles.overlay}>
          <Text style={[styles.mark, responsiveStyles.mark]}>
            {state === "correct" ? "✅" : "❌"}
          </Text>
        </View>
      )}

      {label ? <Text style={styles.label}>{label}</Text> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gloss: {
    position: "absolute",
    height: "28%",
    backgroundColor: colors.text,
    opacity: 0.28,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  mark: { textAlign: "center" },
  label: {
    ...typography.caption,
    color: colors.text,
    marginTop: spacing.xs,
    textShadowColor: colors.bg,
    textShadowRadius: 3,
  },
});
