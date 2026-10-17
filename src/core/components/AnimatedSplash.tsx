import { typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export const SPLASH_BG = "#0F1538"; // must equal the native splash color in app.json

const NAME = "BrainBloom";
const COLORS = [
  "#FFFFFF",
  "#FFFFFF",
  "#FFFFFF",
  "#FFFFFF",
  "#FFFFFF",
  "#22C7A9",
  "#FF4F9A",
  "#FFB400",
  "#8B5CF6",
  "#3B9BFF",
];

function Letter({
  ch,
  i,
  size,
  reduce,
}: {
  ch: string;
  i: number;
  size: number;
  reduce: boolean;
}) {
  const p = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (!reduce)
      p.value = withDelay(
        600 + i * 90,
        withSpring(1, { damping: 8, stiffness: 170 }),
      );
  }, [i, reduce, p]);
  const st = useAnimatedStyle(() => ({
    opacity: Math.min(p.value * 2, 1),
    transform: [
      { translateY: (1 - p.value) * 40 },
      { scale: 0.4 + 0.6 * p.value },
    ],
  }));
  return (
    <Animated.Text
      style={[styles.letter, { fontSize: size, color: COLORS[i] }, st]}
    >
      {ch}
    </Animated.Text>
  );
}

export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const { s } = useResponsive();
  const reduce = useReducedMotion();
  const fade = useSharedValue(1);
  const bounce = useSharedValue(0);
  const sprout = useSharedValue(reduce ? 1 : 0);
  const done = useRef(false);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    fade.value = withTiming(0, { duration: 300 }, (ok) => {
      if (ok) runOnJS(onDone)();
    });
  }, [fade, onDone]);

  useEffect(() => {
    if (!reduce) {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-s(22), {
            duration: 380,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(0, { duration: 380, easing: Easing.in(Easing.quad) }),
        ),
        -1,
      );
      sprout.value = withDelay(
        1700,
        withSpring(1, { damping: 7, stiffness: 140 }),
      );
    }
    const id = setTimeout(finish, reduce ? 900 : 2600);
    return () => clearTimeout(id);
  }, [reduce, s, bounce, sprout, finish]);

  const root = useAnimatedStyle(() => ({ opacity: fade.value }));
  const fox = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));
  const plant = useAnimatedStyle(() => ({
    opacity: sprout.value,
    transform: [{ scale: sprout.value }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, root]}>
      <Pressable
        style={styles.center}
        onPress={finish}
        accessibilityRole="button"
        accessibilityLabel="Skip intro"
      >
        <Animated.Text style={[{ fontSize: s(96) }, fox]}>🦊</Animated.Text>
        <View style={[styles.row, { marginTop: s(16) }]}>
          {NAME.split("").map((ch, i) => (
            <Letter key={i} ch={ch} i={i} size={s(40)} reduce={reduce} />
          ))}
          <Animated.Text style={[{ fontSize: s(34), marginLeft: s(4) }, plant]}>
            🌱
          </Animated.Text>
        </View>
        <Text style={[styles.tag, { fontSize: s(16), marginTop: s(10) }]}>
          Play & learn!
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: SPLASH_BG, zIndex: 999 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center" },
  letter: { ...typography.title },
  tag: { ...typography.body, color: "#8A8FA3" },
});
