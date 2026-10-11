import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius } from "@/core/theme";
import { LinearGradient } from "expo-linear-gradient";
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

type Props = {
  value: number; // 1..n, stays with the tile forever
  index: number; // current board position
  size: number; // grid size (3 or 4)
  tileSize: number;
  gap: number;
  emoji: string;
  gradient: readonly [string, string];
  hinted: boolean;
  onPress: () => void;
};

export function PuzzleTile({
  value,
  index,
  size,
  tileSize,
  gap,
  emoji,
  gradient,
  hinted,
  onPress,
}: Props) {
  const step = tileSize + gap;
  const col = index % size;
  const row = Math.floor(index / size);

  // Start exactly where the tile belongs so it doesn't fly in from (0,0)
  const x = useSharedValue(col * step);
  const y = useSharedValue(row * step);
  const pulse = useSharedValue(1);

  // When the board index changes, animate to the new slot
  useEffect(() => {
    x.value = withSpring(col * step, {
      damping: 26,
      stiffness: 260,
      mass: 0.9,
    });
    y.value = withSpring(row * step, {
      damping: 26,
      stiffness: 260,
      mass: 0.9,
    });
  }, [col, row, step, x, y]);

  // Hint: gentle pulse a few times
  useEffect(() => {
    if (hinted) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 280 }),
          withTiming(1, { duration: 280 }),
        ),
        3,
        false,
      );
    } else {
      pulse.value = 1;
    }
  }, [hinted, pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: pulse.value },
    ],
  }));

  return (
    <Animated.View
      style={[styles.slot, { width: tileSize, height: tileSize }, style]}
    >
      <PressableScale
        onPress={onPress}
        haptic={false}
        scaleTo={0.95}
        style={styles.pressable}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fill, hinted && styles.hinted]}
        >
          <Text style={[styles.emoji, { fontSize: tileSize * 0.45 }]}>
            {emoji}
          </Text>
          <Text style={styles.badge}>{value}</Text>
        </LinearGradient>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slot: { position: "absolute", left: 0, top: 0 },
  pressable: { flex: 1 },
  fill: {
    flex: 1,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  hinted: { borderWidth: 3, borderColor: colors.text },
  emoji: { textAlign: "center" },
  badge: {
    position: "absolute",
    right: 10,
    bottom: 6,
    fontSize: 14,
    fontWeight: "800",
    color: "rgba(255,255,255,0.85)",
  },
});
