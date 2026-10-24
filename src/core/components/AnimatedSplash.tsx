import { typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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

const MASCOT = "🦊"; // change this one line to use another character
const TOTAL = 3500;
const BRAIN = "Brain";
const BLOOM = "Bloom";
const BLOOM_COLORS = ["#22C7A9", "#FF4F9A", "#FFB400", "#8B5CF6", "#3B9BFF"];

const FLOATERS = [
  { e: "⭐", left: 0.08, delay: 0, size: 22 },
  { e: "🔵", left: 0.22, delay: 700, size: 16 },
  { e: "⭐", left: 0.38, delay: 1400, size: 18 },
  { e: "🟡", left: 0.55, delay: 300, size: 16 },
  { e: "⭐", left: 0.7, delay: 1100, size: 24 },
  { e: "🟣", left: 0.85, delay: 500, size: 18 },
  { e: "🟢", left: 0.15, delay: 1800, size: 14 },
  { e: "⭐", left: 0.9, delay: 1600, size: 16 },
];

function Floater({
  e,
  left,
  delay,
  size,
  travel,
  width,
  reduce,
}: {
  e: string;
  left: number;
  delay: number;
  size: number;
  travel: number;
  width: number;
  reduce: boolean;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    p.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 3400, easing: Easing.linear }), -1),
    );
  }, [reduce, delay, p]);
  const st = useAnimatedStyle(() => ({
    opacity: reduce ? 0.15 : Math.sin(p.value * Math.PI) * 0.4,
    transform: [
      { translateY: -p.value * travel },
      { rotate: `${p.value * 40}deg` },
    ],
  }));
  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          bottom: -40,
          left: width * left,
          fontSize: size,
        },
        st,
      ]}
    >
      {e}
    </Animated.Text>
  );
}

function Letter({
  ch,
  i,
  size,
  color,
  reduce,
}: {
  ch: string;
  i: number;
  size: number;
  color: string;
  reduce: boolean;
}) {
  const p = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (!reduce)
      p.value = withDelay(
        750 + i * 80,
        withSpring(1, { damping: 8, stiffness: 170 }),
      );
  }, [i, reduce, p]);
  const st = useAnimatedStyle(() => ({
    opacity: Math.min(p.value * 2, 1),
    transform: [
      { translateY: (1 - p.value) * 36 },
      { scale: 0.4 + 0.6 * p.value },
    ],
  }));
  return (
    <Animated.Text style={[styles.letter, { fontSize: size, color }, st]}>
      {ch}
    </Animated.Text>
  );
}

function Sparkle({
  angle,
  dist,
  reduce,
}: {
  angle: number;
  dist: number;
  reduce: boolean;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    if (!reduce)
      p.value = withDelay(
        2000,
        withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) }),
      );
  }, [reduce, p]);
  const st = useAnimatedStyle(() => ({
    opacity: p.value === 0 ? 0 : 1 - p.value,
    transform: [
      { translateX: Math.cos(angle) * dist * p.value },
      { translateY: Math.sin(angle) * dist * p.value },
      { scale: 0.5 + p.value * 0.8 },
    ],
  }));
  return (
    <Animated.Text
      pointerEvents="none"
      style={[{ position: "absolute", fontSize: 18 }, st]}
    >
      ✨
    </Animated.Text>
  );
}

export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const { s, width, height } = useResponsive();
  const reduce = useReducedMotion();

  const fade = useSharedValue(1);
  const drop = useSharedValue(reduce ? 0 : -s(320));
  const idle = useSharedValue(0);
  const glow = useSharedValue(reduce ? 1 : 0);
  const sprout = useSharedValue(reduce ? 0 : 0);
  const flower = useSharedValue(reduce ? 1 : 0);
  const tag = useSharedValue(reduce ? 1 : 0);
  const bar = useSharedValue(reduce ? 1 : 0);
  const done = useRef(false);

  const barW = s(160);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    fade.value = withTiming(0, { duration: 300 }, (ok) => {
      if (ok) runOnJS(onDone)();
    });
  }, [fade, onDone]);

  useEffect(() => {
    if (!reduce) {
      drop.value = withSpring(0, { damping: 7, stiffness: 120 });
      idle.value = withDelay(
        900,
        withRepeat(
          withSequence(
            withTiming(-s(14), {
              duration: 360,
              easing: Easing.out(Easing.quad),
            }),
            withTiming(0, { duration: 360, easing: Easing.in(Easing.quad) }),
          ),
          -1,
        ),
      );
      glow.value = withDelay(
        300,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
            withTiming(0.6, {
              duration: 900,
              easing: Easing.inOut(Easing.quad),
            }),
          ),
          -1,
        ),
      );
      sprout.value = withDelay(
        1500,
        withSpring(1, { damping: 8, stiffness: 150 }),
      );
      flower.value = withDelay(
        2000,
        withSpring(1, { damping: 6, stiffness: 150 }),
      );
      tag.value = withDelay(1700, withTiming(1, { duration: 500 }));
      bar.value = withTiming(1, {
        duration: TOTAL - 200,
        easing: Easing.linear,
      });
    }
    const id = setTimeout(finish, reduce ? 900 : TOTAL);
    return () => clearTimeout(id);
  }, [reduce, s, drop, idle, glow, sprout, flower, tag, bar, finish]);

  const root = useAnimatedStyle(() => ({ opacity: fade.value }));
  const mascot = useAnimatedStyle(() => ({
    transform: [{ translateY: drop.value + idle.value }],
  }));
  const glowSt = useAnimatedStyle(() => ({
    opacity: 0.22 * glow.value,
    transform: [{ scale: 0.85 + glow.value * 0.25 }],
  }));
  const plantSt = useAnimatedStyle(() => ({
    opacity: sprout.value * (1 - flower.value),
    transform: [{ scale: sprout.value }],
  }));
  const flowerSt = useAnimatedStyle(() => ({
    opacity: flower.value,
    transform: [
      { scale: flower.value },
      { rotate: `${(1 - flower.value) * -60}deg` },
    ],
  }));
  const tagSt = useAnimatedStyle(() => ({ opacity: tag.value }));
  const barSt = useAnimatedStyle(() => ({ width: bar.value * barW }));

  const glowSize = s(260);
  const sparkles = Array.from({ length: 7 }, (_, n) => (n / 7) * Math.PI * 2);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, root]}>
      {FLOATERS.map((f, n) => (
        <Floater
          key={n}
          e={f.e}
          left={f.left}
          delay={f.delay}
          size={s(f.size)}
          travel={height * 0.9}
          width={width}
          reduce={reduce}
        />
      ))}

      <Pressable
        style={styles.center}
        onPress={finish}
        accessibilityRole="button"
        accessibilityLabel="Skip intro"
      >
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                width: glowSize,
                height: glowSize,
                borderRadius: glowSize / 2,
                backgroundColor: "#8B5CF6",
              },
              glowSt,
            ]}
          />
          <Animated.Text style={[{ fontSize: s(104) }, mascot]}>
            {MASCOT}
          </Animated.Text>
        </View>

        <View style={[styles.row, { marginTop: s(18) }]}>
          {BRAIN.split("").map((ch, i) => (
            <Letter
              key={`b${i}`}
              ch={ch}
              i={i}
              size={s(38)}
              color="#FFFFFF"
              reduce={reduce}
            />
          ))}
          {BLOOM.split("").map((ch, i) => (
            <Letter
              key={`l${i}`}
              ch={ch}
              i={i + BRAIN.length}
              size={s(38)}
              color={BLOOM_COLORS[i]}
              reduce={reduce}
            />
          ))}
          <View
            style={{
              width: s(40),
              height: s(44),
              marginLeft: s(2),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Animated.Text
              style={[{ position: "absolute", fontSize: s(32) }, plantSt]}
            >
              🌱
            </Animated.Text>
            <Animated.Text
              style={[{ position: "absolute", fontSize: s(34) }, flowerSt]}
            >
              🌸
            </Animated.Text>
            {sparkles.map((a, n) => (
              <Sparkle key={n} angle={a} dist={s(46)} reduce={reduce} />
            ))}
          </View>
        </View>

        <Animated.Text
          style={[styles.tag, { fontSize: s(16), marginTop: s(10) }, tagSt]}
        >
          Kids Games · Play & learn!
        </Animated.Text>
      </Pressable>

      <View
        style={[styles.barTrack, { width: barW, height: s(8), bottom: s(70) }]}
      >
        <Animated.View style={[styles.barFill, barSt]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: SPLASH_BG,
    zIndex: 999,
    alignItems: "center",
    overflow: "hidden",
  },
  center: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center" },
  letter: { ...typography.title },
  tag: { ...typography.body, color: "#A9B0D0" },
  barTrack: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 999, backgroundColor: "#22C7A9" },
});
