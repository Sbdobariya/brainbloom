import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { StyleSheet, Text } from "react-native";

type Props = {
  emoji: string;
  label: string;
  count: number;
  onPress: () => void;
};
export function LifelineButton({ emoji, label, count, onPress }: Props) {
  const { s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    button: {
      minHeight: Math.max(56, s(64)),
      gap: s(spacing.xs),
      borderWidth: s(1),
      borderRadius: s(radius.lg),
    },
    emoji: { fontSize: s(24) },
    label: { fontSize: s(typography.caption.fontSize) },
  });
  const empty = count <= 0;
  return (
    <PressableScale
      onPress={onPress}
      disabled={empty}
      style={[styles.button, responsiveStyles.button, empty && styles.empty]}
    >
      <Text style={[styles.emoji, responsiveStyles.emoji]}>{emoji}</Text>
      <Text
        style={[styles.label, responsiveStyles.label]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label} ×{count}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  },
  empty: { opacity: 0.35 },
  emoji: {},
  label: { ...typography.caption, color: colors.textMuted },
});
