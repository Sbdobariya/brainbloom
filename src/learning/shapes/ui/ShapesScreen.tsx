import { playSound, speak } from "@/core/audio/feedback";
import { GameScreen } from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { shapes, type ShapeItem } from "../data/shapes";
import { ShapeView } from "./ShapeView";

const SHAPE_COLORS = [
  colors.pink,
  colors.blue,
  colors.yellow,
  colors.green,
  colors.orange,
  colors.purple,
  colors.teal,
  colors.red,
];
const sayIt = (item: ShapeItem) => speak(`${item.name}. ${item.fact}`);

type CardProps = { item: ShapeItem; color: string; dir: 1 | -1 };

// Re-created (via key) for every shape: slides in and speaks on mount
function ShapeCard({ item, color, dir }: CardProps) {
  const { s } = useResponsive();
  const x = useSharedValue(dir * 90);
  const opacity = useSharedValue(0);
  const wobble = useSharedValue(0);
  const scale = useSharedValue(1);
  const shapeSize = Math.max(120, s(190));

  useEffect(() => {
    x.value = withSpring(0, { damping: 16, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 220 });
    sayIt(item);
  }, [item, x, opacity]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }],
  }));
  const shapeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${wobble.value}deg` }],
  }));

  const onTapShape = () => {
    // Squash-and-wobble when the child taps the shape
    scale.value = withSequence(
      withTiming(1.15, { duration: 120 }),
      withSpring(1, { damping: 5, stiffness: 200 }),
    );
    wobble.value = withSequence(
      withTiming(-8, { duration: 80 }),
      withTiming(8, { duration: 120 }),
      withSpring(0, { damping: 6 }),
    );
    playSound("pop");
    sayIt(item);
  };

  return (
    <Animated.View style={[styles.card, { borderColor: color }, cardStyle]}>
      <PressableScale onPress={onTapShape} haptic={false} scaleTo={0.92}>
        <Animated.View style={shapeStyle}>
          <ShapeView id={item.id} size={shapeSize} color={color} />
        </Animated.View>
      </PressableScale>
      <Text style={[styles.name, { color }]}>{item.name}</Text>
      <Text style={styles.fact}>{item.fact}</Text>
      <Text style={styles.tapHint}>Tap the shape to hear it again 🔊</Text>
    </Animated.View>
  );
}

export function ShapesScreen() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const item = shapes[index];
  const color = SHAPE_COLORS[index % SHAPE_COLORS.length];

  const go = (step: 1 | -1) => {
    const next = index + step;
    if (next < 0 || next >= shapes.length) return;
    setDir(step);
    setIndex(next);
    playSound("tap");
  };

  return (
    <GameScreen title="🔷 Shapes" subtitle="Learn the shapes">
      <Text style={styles.progress}>
        {index + 1} / {shapes.length}
      </Text>

      <View style={styles.stage}>
        <ShapeCard key={index} item={item} color={color} dir={dir} />
      </View>

      <View style={styles.nav}>
        <PressableScale
          style={[styles.navButton, index === 0 && styles.navDisabled]}
          disabled={index === 0}
          haptic={false}
          onPress={() => go(-1)}
        >
          <Text style={styles.navText}>◀</Text>
        </PressableScale>

        <PressableScale
          style={styles.speaker}
          haptic={false}
          onPress={() => sayIt(item)}
        >
          <Text style={styles.speakerText}>🔊</Text>
        </PressableScale>

        <PressableScale
          style={[
            styles.navButton,
            index === shapes.length - 1 && styles.navDisabled,
          ]}
          disabled={index === shapes.length - 1}
          haptic={false}
          onPress={() => go(1)}
        >
          <Text style={styles.navText}>▶</Text>
        </PressableScale>
      </View>
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  progress: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  stage: { flex: 1, justifyContent: "center", overflow: "hidden" },
  card: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderRadius: radius.lg,
  },
  name: { ...typography.title, fontSize: 40 },
  fact: { ...typography.body, color: colors.text, textAlign: "center" },
  tapHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing.xl,
  },
  navButton: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderRadius: radius.pill,
  },
  navDisabled: { opacity: 0.3 },
  navText: { color: colors.text, fontSize: 26 },
  speaker: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.purple,
    borderRadius: radius.pill,
  },
  speakerText: { fontSize: 38 },
});
