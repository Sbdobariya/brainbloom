import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius } from "@/core/theme";
import { StyleSheet, Text } from "react-native";

type Props = { letter: string; used: boolean; onPress: () => void };

export function LetterTile({ letter, used, onPress }: Props) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={used}
      style={[styles.tile, used && styles.used]}
    >
      <Text style={styles.letter}>{letter}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderRadius: radius.md,
  },
  used: { opacity: 0.25 },
  letter: { fontSize: 30, fontWeight: "800", color: colors.text },
});
