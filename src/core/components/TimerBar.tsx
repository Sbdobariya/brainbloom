import { colors, radius, spacing } from "@/core/theme";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = { progress: number };

export function TimerBar({ progress }: Props) {
  const value = useSharedValue(progress);

  useEffect(() => {
    value.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.linear,
    });
  }, [progress, value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${value.value * 100}%`,
    backgroundColor: interpolateColor(
      value.value,
      [0, 0.3, 1],
      [colors.red, colors.orange, colors.teal],
    ),
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: radius.pill },
});
