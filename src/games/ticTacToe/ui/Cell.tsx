import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius } from "@/core/theme";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { Cell as CellValue } from "../logic/ticTacToe";

type Props = {
  mark: CellValue;
  size: number;
  highlighted: boolean;
  disabled: boolean;
  onPress: () => void;
};

export function Cell({ mark, size, highlighted, disabled, onPress }: Props) {
  const markScale = useSharedValue(0);
  const pulse = useSharedValue(1);

  // Pop the mark in when it appears, reset when the board is cleared
  useEffect(() => {
    if (mark) {
      markScale.value = 0;
      markScale.value = withSpring(1, { damping: 8, stiffness: 180 });
    } else {
      markScale.value = 0;
    }
  }, [mark, markScale]);

  // Winning cells pulse 3 times, then settle
  useEffect(() => {
    if (highlighted) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 300 }),
          withTiming(1, { duration: 300 }),
        ),
        3,
        false,
      );
    } else {
      pulse.value = 1;
    }
  }, [highlighted, pulse]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: markScale.value * pulse.value }],
  }));

  const color = mark === "X" ? colors.pink : colors.teal;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.92}
      style={[
        styles.cell,
        { width: size, height: size },
        highlighted && { borderColor: color, backgroundColor: colors.bgSoft },
      ]}
    >
      <Animated.Text
        style={[styles.mark, { color, fontSize: size * 0.6 }, markStyle]}
      >
        {mark ?? ""}
      </Animated.Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  cell: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  mark: { fontWeight: "800" },
});
