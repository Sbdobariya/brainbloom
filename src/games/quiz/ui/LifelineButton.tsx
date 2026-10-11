import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius, spacing, typography } from "@/core/theme";
import { StyleSheet, Text } from "react-native";

type Props = {
  emoji: string;
  label: string;
  count: number;
  onPress: () => void;
};
const MIN_HEIGHT = 64;

export function LifelineButton({ emoji, label, count, onPress }: Props) {
  const empty = count <= 0;
  return (
    <PressableScale
      onPress={onPress}
      disabled={empty}
      style={[styles.button, empty && styles.empty]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>
        {label} ×{count}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: MIN_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  empty: { opacity: 0.35 },
  emoji: { fontSize: 24 },
  label: { ...typography.caption, color: colors.textMuted },
});
