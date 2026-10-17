import { PressableScale } from "@/core/components/PressableScale";
import { colors } from "@/core/theme";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type Props = {
  emoji: string;
  order: number | null; // 1, 2, 3... once counted, null before
  color: string;
  onPress: () => void;
};

export function CountItem({ emoji, order, color, onPress }: Props) {
  const pop = useSharedValue(1);
  const badge = useSharedValue(0);

  useEffect(() => {
    if (order !== null) {
      // Jump up, settle, and spring the number badge in
      pop.value = withSequence(
        withTiming(1.35, { duration: 110 }),
        withSpring(1, { damping: 5, stiffness: 220 }),
      );
      badge.value = withSpring(1, { damping: 8, stiffness: 240 });
    } else {
      pop.value = 1;
      badge.value = 0;
    }
  }, [order, pop, badge]);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badge.value,
    transform: [{ scale: badge.value }],
  }));

  return (
    <PressableScale
      onPress={onPress}
      disabled={order !== null}
      haptic={false}
      scaleTo={0.88}
      style={styles.item}
    >
      <Animated.Text
        style={[styles.emoji, order !== null && styles.counted, emojiStyle]}
      >
        {emoji}
      </Animated.Text>
      <Animated.View
        style={[styles.badge, { backgroundColor: color }, badgeStyle]}
      >
        <Text style={styles.badgeText}>{order ?? ""}</Text>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  item: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 44 },
  counted: { opacity: 0.85 },
  badge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 14, fontWeight: "800", color: colors.bg },
});
