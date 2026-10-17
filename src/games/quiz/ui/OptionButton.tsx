import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
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
  const { cardWidth, s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    wrapper: { width: cardWidth },
    button: {
      minHeight: s(72),
      gap: s(spacing.md),
      paddingHorizontal: s(spacing.md),
      borderWidth: s(2),
      borderRadius: s(radius.lg),
    },
    badge: {
      width: s(32),
      height: s(32),
      borderRadius: s(radius.sm),
    },
  });
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
      style={[responsiveStyles.wrapper, style]}
      pointerEvents={state === "idle" ? "auto" : "none"}
    >
      <PressableScale
        onPress={onPress}
        style={[styles.button, responsiveStyles.button, stateStyle]}
      >
        <View style={[styles.badge, responsiveStyles.badge]}>
          <Text style={styles.badgeText}>{letter}</Text>
        </View>
        <Text
          style={styles.label}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {label}
        </Text>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSoft,
  },
  badgeText: { ...typography.caption, color: colors.textMuted },
  label: { ...typography.heading, color: colors.text, flex: 1 },
});
