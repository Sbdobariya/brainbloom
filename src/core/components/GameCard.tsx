import { colors, radius, spacing, typography } from "@/core/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { PressableScale } from "./PressableScale";

type Props = {
  title: string;
  emoji: string;
  gradient: readonly [string, string];
  locked?: boolean;
  index: number; // position in the grid, used to stagger the entrance
  onPress: () => void;
};

export function GameCard({
  title,
  emoji,
  gradient,
  locked,
  index,
  onPress,
}: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    // withDelay makes each card start a little after the previous one
    progress.value = withDelay(
      index * 90,
      withSpring(1, { damping: 12, stiffness: 120 }),
    );
  }, [index, progress]);

  const entrance = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 40 },
      { scale: 0.8 + progress.value * 0.2 },
    ],
  }));

  return (
    <Animated.View style={[styles.wrapper, entrance]}>
      <PressableScale onPress={onPress} style={styles.pressable}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, locked && styles.locked]}
        >
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.title}>{title}</Text>
          {locked && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Soon</Text>
            </View>
          )}
        </LinearGradient>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "48%", marginBottom: spacing.lg },
  pressable: { width: "100%" },
  card: {
    height: 150,
    borderRadius: radius.lg,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  locked: { opacity: 0.6 },
  emoji: { fontSize: 44 },
  title: { ...typography.heading, color: colors.text },
  badge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.caption, color: colors.text },
});
