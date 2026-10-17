import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export type RoundStatus = "playing" | "correct" | "wrong" | "timeout";

type SlotProps = {
  letter: string | null;
  index: number;
  status: RoundStatus;
  onPress: () => void;
};

function Slot({ letter, index, status, onPress }: SlotProps) {
  const { s } = useResponsive();
  const slotWidth = Math.max(48, s(60));
  const slotHeight = Math.max(56, s(68));
  const pop = useSharedValue(1);
  const bounce = useSharedValue(0);

  // Pop whenever a letter lands in this slot
  useEffect(() => {
    if (letter) {
      pop.value = 0.6;
      pop.value = withSpring(1, { damping: 8, stiffness: 220 });
    }
  }, [letter, pop]);

  // Correct answer: letters hop one after another (delay grows with index)
  useEffect(() => {
    if (status === "correct") {
      bounce.value = withDelay(
        index * 80,
        withSequence(
          withTiming(-18, { duration: 150 }),
          withSpring(0, { damping: 6 }),
        ),
      );
    }
  }, [status, index, bounce]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }, { translateY: bounce.value }],
  }));

  const borderColor =
    status === "correct"
      ? colors.green
      : status === "wrong"
        ? colors.orange
        : colors.cardBorder;

  return (
    <PressableScale
      onPress={onPress}
      disabled={!letter || status !== "playing"}
      haptic={false}
    >
      <Animated.View
        style={[
          styles.slot,
          { borderColor, width: slotWidth, height: slotHeight },
          style,
        ]}
      >
        <Text
          style={[
            styles.letter,
            { fontSize: Math.max(22, s(32)) },
            status === "timeout" && styles.reveal,
          ]}
        >
          {letter ?? ""}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}

type Props = {
  letters: (string | null)[]; // one entry per slot
  status: RoundStatus;
  onRemove: (index: number) => void;
};

export function AnswerSlots({ letters, status, onRemove }: Props) {
  const { s } = useResponsive();
  const shake = useSharedValue(0);

  // Wrong answer: quick left-right shake. Gentle, no harsh red.
  useEffect(() => {
    if (status === "wrong") {
      shake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withRepeat(withTiming(10, { duration: 100 }), 4, true),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [status, shake]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <Animated.View style={[styles.row, rowStyle]}>
      {letters.map((l, i) => (
        <Slot
          key={i}
          letter={l}
          index={i}
          status={status}
          onPress={() => onRemove(i)}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", gap: spacing.sm },
  slot: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSoft,
    borderWidth: 2,
    borderRadius: radius.md,
  },
  letter: { ...typography.heading, color: colors.text },
  reveal: { color: colors.teal },
});
