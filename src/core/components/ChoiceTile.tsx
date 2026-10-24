import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius, typography } from "@/core/theme";
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

export type ChoiceState = "idle" | "correct" | "wrong";

type Props = {
  label: string;
  color: string;
  state: ChoiceState;
  onPress: () => void;
  fontSize?: number;
  swatch?: string;
};

export function ChoiceTile({
  label,
  color,
  state,
  onPress,
  fontSize = 56,
  swatch,
}: Props) {
  const { s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    tile: {
      minHeight: Math.max(48, s(110)),
      borderWidth: s(3),
      borderRadius: s(radius.lg),
    },
    label: { fontSize: s(fontSize) },
    swatch: { width: s(64), height: s(64), borderRadius: s(32) },
  });
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
          responsiveStyles.tile,
          { borderColor: color },
          state === "correct" && { backgroundColor: color },
        ]}
      >
        {swatch !== undefined ? (
          <View style={[styles.swatch, { backgroundColor: swatch }]} />
        ) : (
          <Text
            style={[
              styles.letter,
              responsiveStyles.label,
              { color: state === "correct" ? colors.bg : color },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
          >
            {label}
          </Text>
        )}
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  tile: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  letter: { ...typography.title },
  swatch: { alignItems: "center", justifyContent: "center" },
});
