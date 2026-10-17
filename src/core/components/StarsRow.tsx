import { haptic as feedbackHaptic, playSound } from "@/core/audio/feedback";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";

type StarProps = { index: number; filled: boolean };

function Star({ index, filled }: StarProps) {
  const scale = useSharedValue(0);
  const tilt = useSharedValue(-35);

  useEffect(() => {
    // Each star starts a little after the previous one
    const delay = 450 + index * 260;
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 7, stiffness: 170 }),
    );
    tilt.value = withDelay(
      delay,
      withSpring(0, { damping: 9, stiffness: 120 }),
    );
    if (filled) {
      const id = setTimeout(() => {
        feedbackHaptic.tap();
        playSound("star");
      }, delay);
      return () => clearTimeout(id);
    }
  }, [index, filled, scale, tilt]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${tilt.value}deg` }],
  }));

  return (
    <Animated.Text
      style={[
        styles.star,
        index === 1 && styles.middle,
        !filled && styles.empty,
        style,
      ]}
    >
      ⭐
    </Animated.Text>
  );
}

type Props = { stars: number };

export function StarsRow({ stars }: Props) {
  return (
    <View style={styles.row}>
      {[0, 1, 2].map((i) => (
        <Star key={i} index={i} filled={i < stars} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 6,
  },
  star: { fontSize: 40 },
  middle: { fontSize: 54, marginBottom: 6 },
  empty: { opacity: 0.2 },
});
