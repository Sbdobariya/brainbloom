import { colors, radius } from "@/core/theme";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = { progress: number }; // 1 = full, 0 = empty

export function TimerBar({ progress }: Props) {
  const p = useSharedValue(progress);

  useEffect(() => {
    // Linear easing makes it drain at a steady speed, like a real timer
    p.value = withTiming(progress, { duration: 1000, easing: Easing.linear });
  }, [progress, p]);

  const style = useAnimatedStyle(() => ({
    width: `${p.value * 100}%`,
    // Color shifts teal -> orange -> red as time runs out
    backgroundColor: interpolateColor(
      p.value,
      [0, 0.3, 1],
      [colors.red, colors.orange, colors.teal],
    ),
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 12,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: radius.pill },
});
