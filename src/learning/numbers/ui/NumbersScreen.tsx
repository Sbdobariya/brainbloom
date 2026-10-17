import { haptic, playSound, speak } from "@/core/audio/feedback";
import { GameScreen } from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { numbers, type NumberItem } from "../data/numbers";
import { CountItem } from "./CountItem";

const COLORS = [
  colors.pink,
  colors.orange,
  colors.yellow,
  colors.green,
  colors.teal,
  colors.blue,
  colors.purple,
];

const CAPITAL = (w: string) => w[0].toUpperCase() + w.slice(1);

type CardProps = { item: NumberItem; color: string; dir: 1 | -1 };

// Re-created (via key) for every number, so its state starts fresh each time
function NumberCard({ item, color, dir }: CardProps) {
  const [counted, setCounted] = useState<number[]>([]); // item indexes, in tap order
  const x = useSharedValue(dir * 90);
  const opacity = useSharedValue(0);
  const numeral = useSharedValue(1);

  useEffect(() => {
    x.value = withSpring(0, { damping: 16, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 220 });
    speak(`${CAPITAL(item.word)}. Can you count them?`);
  }, [item, x, opacity]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }],
  }));
  const numeralStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numeral.value }],
  }));

  const onCount = (i: number) => {
    if (counted.includes(i)) return;
    const next = [...counted, i];
    setCounted(next);
    playSound("pop");
    haptic.tap();

    if (next.length === item.n) {
      // All counted: celebrate and say the full sentence
      numeral.value = withSequence(
        withTiming(1.35, { duration: 160 }),
        withSpring(1, { damping: 5, stiffness: 180 }),
      );
      playSound("correct");
      haptic.success();
      speak(
        `${CAPITAL(item.word)}! ${CAPITAL(item.word)} ${item.n === 1 ? item.name : item.plural}`,
      );
    } else {
      speak(numbers[next.length - 1].word); // "one", "two", ...
    }
  };

  const done = counted.length === item.n;

  return (
    <Animated.View style={[styles.card, { borderColor: color }, cardStyle]}>
      <Animated.Text style={[styles.numeral, { color }, numeralStyle]}>
        {item.n}
      </Animated.Text>
      <Text style={styles.word}>{item.word}</Text>

      <View style={styles.items}>
        {Array.from({ length: item.n }, (_, i) => (
          <CountItem
            key={i}
            emoji={item.emoji}
            color={color}
            order={counted.includes(i) ? counted.indexOf(i) + 1 : null}
            onPress={() => onCount(i)}
          />
        ))}
      </View>

      <Text style={styles.tip}>
        {done ? "Great counting! 🎉" : "Tap each picture to count 👆"}
      </Text>
    </Animated.View>
  );
}

export function NumbersScreen() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const item = numbers[index];
  const color = COLORS[index % COLORS.length];

  const go = (step: 1 | -1) => {
    const next = index + step;
    if (next < 0 || next >= numbers.length) return;
    setDir(step);
    setIndex(next);
    playSound("tap");
  };

  return (
    <GameScreen title="🔢 123" subtitle="Learn to count">
      <Text style={styles.progress}>
        {index + 1} / {numbers.length}
      </Text>

      <View style={styles.stage}>
        <NumberCard key={index} item={item} color={color} dir={dir} />
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
          onPress={() => speak(`${CAPITAL(item.word)}. Can you count them?`)}
        >
          <Text style={styles.speakerText}>🔊</Text>
        </PressableScale>

        <PressableScale
          style={[
            styles.navButton,
            index === numbers.length - 1 && styles.navDisabled,
          ]}
          disabled={index === numbers.length - 1}
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
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderRadius: radius.lg,
  },
  numeral: { fontSize: 110, fontWeight: "800", lineHeight: 120 },
  word: { ...typography.title, color: colors.text },
  items: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: 5 * 68,
    marginTop: spacing.md,
    minHeight: 64,
  },
  tip: {
    ...typography.body,
    color: colors.teal,
    marginTop: spacing.md,
    minHeight: 22,
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
