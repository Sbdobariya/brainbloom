import { playSound, speak } from "@/core/audio/feedback";
import { GameScreen, HowToPlayOverlay } from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { useHowToPlay } from "@/core/howToPlay/useHowToPlay";
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

type CardProps = {
  item: ShapeItem;
  color: string;
  dir: 1 | -1;
  audioEnabled: boolean;
};

// Re-created (via key) for every shape: slides in and speaks on mount
function ShapeCard({ item, color, dir, audioEnabled }: CardProps) {
  const { s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    card: {
      gap: s(spacing.sm),
      paddingVertical: s(spacing.xl),
      paddingHorizontal: s(spacing.lg),
      borderWidth: s(3),
      borderRadius: s(radius.lg),
    },
    name: { fontSize: s(40) },
    fact: { fontSize: s(typography.body.fontSize) },
    tapHint: {
      fontSize: s(typography.caption.fontSize),
      marginTop: s(spacing.xs),
    },
  });
  const x = useSharedValue(dir * 90);
  const opacity = useSharedValue(0);
  const wobble = useSharedValue(0);
  const scale = useSharedValue(1);
  const shapeSize = Math.max(120, s(190));

  useEffect(() => {
    x.value = withSpring(0, { damping: 16, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 220 });
    if (audioEnabled) sayIt(item);
  }, [item, x, opacity, audioEnabled]);

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
    <Animated.View
      style={[
        styles.card,
        responsiveStyles.card,
        { borderColor: color },
        cardStyle,
      ]}
    >
      <PressableScale onPress={onTapShape} haptic={false} scaleTo={0.92}>
        <Animated.View style={shapeStyle}>
          <ShapeView id={item.id} size={shapeSize} color={color} />
        </Animated.View>
      </PressableScale>
      <Text
        style={[styles.name, responsiveStyles.name, { color }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {item.name}
      </Text>
      <Text style={[styles.fact, responsiveStyles.fact]}>{item.fact}</Text>
      <Text style={[styles.tapHint, responsiveStyles.tapHint]}>
        Tap the shape to hear it again 🔊
      </Text>
    </Animated.View>
  );
}

export function ShapesScreen() {
  const help = useHowToPlay("shapes");
  const { s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    progress: {
      marginTop: s(spacing.lg),
      fontSize: s(typography.caption.fontSize),
    },
    nav: { paddingBottom: s(spacing.xl) },
    navButton: {
      width: Math.max(56, s(72)),
      height: Math.max(56, s(72)),
      borderWidth: s(2),
      borderRadius: s(radius.pill),
    },
    speaker: {
      width: Math.max(56, s(88)),
      height: Math.max(56, s(88)),
      borderRadius: s(radius.pill),
    },
    navText: { fontSize: s(26) },
    speakerText: { fontSize: s(38) },
  });
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
    <>
      <GameScreen
        title="🔷 Shapes"
        subtitle="Learn the shapes"
        onHelp={help.open}
      >
        <Text style={[styles.progress, responsiveStyles.progress]}>
          {index + 1} / {shapes.length}
        </Text>

        <View style={styles.stage}>
          <ShapeCard
            key={index}
            item={item}
            color={color}
            dir={dir}
            audioEnabled={!help.visible}
          />
        </View>

        <View style={[styles.nav, responsiveStyles.nav]}>
          <PressableScale
            style={[
              styles.navButton,
              responsiveStyles.navButton,
              index === 0 && styles.navDisabled,
            ]}
            disabled={index === 0}
            haptic={false}
            onPress={() => go(-1)}
          >
            <Text style={[styles.navText, responsiveStyles.navText]}>◀</Text>
          </PressableScale>

          <PressableScale
            style={[styles.speaker, responsiveStyles.speaker]}
            haptic={false}
            onPress={() => sayIt(item)}
          >
            <Text style={[styles.speakerText, responsiveStyles.speakerText]}>
              🔊
            </Text>
          </PressableScale>

          <PressableScale
            style={[
              styles.navButton,
              responsiveStyles.navButton,
              index === shapes.length - 1 && styles.navDisabled,
            ]}
            disabled={index === shapes.length - 1}
            haptic={false}
            onPress={() => go(1)}
          >
            <Text style={[styles.navText, responsiveStyles.navText]}>▶</Text>
          </PressableScale>
        </View>
      </GameScreen>
      <HowToPlayOverlay
        id="shapes"
        visible={help.visible}
        onClose={help.close}
      />
    </>
  );
}

const styles = StyleSheet.create({
  progress: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  stage: { flex: 1, justifyContent: "center" },
  card: {
    alignItems: "center",
    backgroundColor: colors.card,
  },
  name: { ...typography.title },
  fact: { ...typography.body, color: colors.text, textAlign: "center" },
  tapHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  },
  navDisabled: { opacity: 0.3 },
  navText: { color: colors.text },
  speaker: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.purple,
  },
  speakerText: {},
});
