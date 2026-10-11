import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export type OptionState = "idle" | "correct" | "wrong" | "hidden" | "dimmed";

type Props = {
  letter: string;
  label: string;
  state: OptionState;
  onPress: () => void;
};

export function OptionButton({ letter, label, state, onPress }: Props) {
  const shake = useSharedValue(0);
  const pop = useSharedValue(1);
  const fade = useSharedValue(1);

  useEffect(() => {
    // Opacity follows the state: hidden = gone, dimmed = faded, otherwise full
    fade.value = withTiming(
      state === "hidden" ? 0 : state === "dimmed" ? 0.4 : 1,
      {
        duration: 250,
      },
    );

    if (state === "wrong") {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withRepeat(withTiming(8, { duration: 90 }), 4, true),
        withTiming(0, { duration: 50 }),
      );
    } else if (state === "correct") {
      pop.value = withSequence(
        withTiming(1.06, { duration: 120 }),
        withSpring(1, { damping: 6 }),
      );
    } else if (state === "idle") {
      shake.value = 0;
      pop.value = 1;
    }
  }, [state, shake, pop, fade]);

  const style = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateX: shake.value }, { scale: pop.value }],
  }));

  const stateStyle =
    state === "correct"
      ? styles.correct
      : state === "wrong"
        ? styles.wrong
        : null;

  return (
    <Animated.View
      style={[styles.wrapper, style]}
      pointerEvents={state === "idle" ? "auto" : "none"}
    >
      <PressableScale onPress={onPress} style={[styles.button, stateStyle]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{letter}</Text>
        </View>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "48%" },
  button: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderRadius: radius.lg,
  },
  correct: {
    borderColor: colors.green,
    backgroundColor: "rgba(46,213,115,0.18)",
  },
  wrong: {
    borderColor: colors.orange,
    backgroundColor: "rgba(255,159,28,0.18)",
  },
  badge: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSoft,
    borderRadius: radius.sm,
  },
  badgeText: { ...typography.caption, color: colors.textMuted },
  label: { ...typography.heading, color: colors.text, flex: 1 },
});
