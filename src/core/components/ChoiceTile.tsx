import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius } from "@/core/theme";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export type ChoiceState = "idle" | "correct" | "wrong";

type Props = {
  label: string;
  color: string;
  state: ChoiceState;
  onPress: () => void;
};

export function ChoiceTile({ label, color, state, onPress }: Props) {
  const shake = useSharedValue(0);
  const pop = useSharedValue(1);
  const fade = useSharedValue(1);

  useEffect(() => {
    if (state === "wrong") {
      // Gentle shake, then fade so the child can see it is not the answer
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withRepeat(withTiming(8, { duration: 90 }), 4, true),
        withTiming(0, { duration: 50 }),
      );
      fade.value = withTiming(0.3, { duration: 300 });
    } else if (state === "correct") {
      pop.value = withSequence(
        withTiming(1.2, { duration: 140 }),
        withSpring(1.08, { damping: 6 }),
      );
    } else {
      shake.value = 0;
      pop.value = 1;
      fade.value = 1;
    }
  }, [state, shake, pop, fade]);

  const style = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateX: shake.value }, { scale: pop.value }],
  }));

  return (
    <Animated.View
      style={[styles.wrap, style]}
      pointerEvents={state === "idle" ? "auto" : "none"}
    >
      <PressableScale
        onPress={onPress}
        haptic={false}
        scaleTo={0.92}
        style={[
          styles.tile,
          { borderColor: color },
          state === "correct" && { backgroundColor: color },
        ]}
      >
        <Text
          style={[
            styles.letter,
            { color: state === "correct" ? colors.bg : color },
          ]}
        >
          {label}
        </Text>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  tile: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 3,
    borderRadius: radius.lg,
  },
  letter: { fontSize: 56, fontWeight: "800" },
});
