import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { StyleSheet, Text } from "react-native";

type Props = { letter: string; used: boolean; onPress: () => void };

export function LetterTile({ letter, used, onPress }: Props) {
  const { s } = useResponsive();
  const tileSize = Math.max(56, s(64));
  const fontSize = Math.max(24, s(30));

  return (
    <PressableScale
      onPress={onPress}
      disabled={used}
      style={[
        styles.tile,
        { width: tileSize, height: tileSize },
        used && styles.used,
      ]}
    >
      <Text style={[styles.letter, { fontSize }]}>{letter}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderRadius: radius.md,
  },
  used: { opacity: 0.25 },
  letter: { ...typography.heading, color: colors.text },
});
