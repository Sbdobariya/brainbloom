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
import { colorItems, type ColorItem } from "../data/colors";

const sayIt = (item: ColorItem) =>
  speak(`${item.name}. ${item.name}, like a ${item.thing}`);

type CardProps = { item: ColorItem; dir: 1 | -1 };

function ColorCard({ item, dir }: CardProps) {
  const { s } = useResponsive();
  const x = useSharedValue(dir * 90);
  const opacity = useSharedValue(0);
  const wobble = useSharedValue(0);
  const scale = useSharedValue(1);
  const circleSize = Math.max(120, s(190));

  useEffect(() => {
    x.value = withSpring(0, { damping: 16, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 220 });
    sayIt(item);
  }, [item, x, opacity]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }],
  }));
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${wobble.value}deg` }],
  }));

  const onTapColor = () => {
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
    <Animated.View style={[styles.card, { borderColor: item.hex }, cardStyle]}>
      <PressableScale onPress={onTapColor} haptic={false} scaleTo={0.92}>
        <Animated.View style={circleStyle}>
          <View
            style={[
              styles.circle,
              {
                backgroundColor: item.hex,
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
              },
            ]}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
        </Animated.View>
      </PressableScale>
      <Text style={[styles.name, { color: item.hex }]}>{item.name}</Text>
      <Text style={styles.fact}>{`${item.name}, like a ${item.thing}`}</Text>
      <Text style={styles.tapHint}>Tap the color to hear it again 🔊</Text>
    </Animated.View>
  );
}

export function ColorsScreen() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const item = colorItems[index];

  const go = (step: 1 | -1) => {
    const next = index + step;
    if (next < 0 || next >= colorItems.length) return;
    setDir(step);
    setIndex(next);
    playSound("tap");
  };

  return (
    <GameScreen title="🌈 Colors" subtitle="Learn the colors">
      <Text style={styles.progress}>
        {index + 1} / {colorItems.length}
      </Text>

      <View style={styles.stage}>
        <ColorCard key={index} item={item} dir={dir} />
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
            index === colorItems.length - 1 && styles.navDisabled,
          ]}
          disabled={index === colorItems.length - 1}
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
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 80 },
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
