import { haptic, playSound, speak } from "@/core/audio/feedback";
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

type CardProps = {
  item: NumberItem;
  color: string;
  dir: 1 | -1;
  audioEnabled: boolean;
};

// Re-created (via key) for every number, so its state starts fresh each time
function NumberCard({ item, color, dir, audioEnabled }: CardProps) {
  const { s } = useResponsive();
  const itemSize = Math.max(48, s(64));
  const itemGap = s(spacing.xs);
  const itemRows = Math.ceil(item.n / 5);
  const responsiveStyles = StyleSheet.create({
    card: {
      gap: s(spacing.sm),
      paddingVertical: s(spacing.xl),
      paddingHorizontal: s(spacing.md),
      borderWidth: s(3),
      borderRadius: s(radius.lg),
    },
    numeral: { fontSize: s(110), lineHeight: s(120) },
    word: { fontSize: s(typography.title.fontSize) },
    items: {
      width: itemSize * 5 + itemGap * 4,
      minHeight: itemRows * itemSize + Math.max(0, itemRows - 1) * itemGap,
      gap: itemGap,
      marginTop: s(spacing.md),
    },
    itemRow: { flexDirection: "row", gap: itemGap },
    tip: {
      fontSize: s(typography.body.fontSize),
      marginTop: s(spacing.md),
      minHeight: s(22),
    },
  });
  const [counted, setCounted] = useState<number[]>([]); // item indexes, in tap order
  const x = useSharedValue(dir * 90);
  const opacity = useSharedValue(0);
  const numeral = useSharedValue(1);

  useEffect(() => {
    x.value = withSpring(0, { damping: 16, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 220 });
    if (audioEnabled) speak(`${CAPITAL(item.word)}. Can you count them?`);
  }, [item, x, opacity, audioEnabled]);

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
    <Animated.View
      style={[
        styles.card,
        responsiveStyles.card,
        { borderColor: color },
        cardStyle,
      ]}
    >
      <Animated.Text
        style={[
          styles.numeral,
          responsiveStyles.numeral,
          { color },
          numeralStyle,
        ]}
      >
        {item.n}
      </Animated.Text>
      <Text style={[styles.word, responsiveStyles.word]}>{item.word}</Text>

      <View style={[styles.items, responsiveStyles.items]}>
        {Array.from({ length: itemRows }, (_, row) => (
          <View key={row} style={responsiveStyles.itemRow}>
            {Array.from({ length: Math.min(5, item.n - row * 5) }, (_, col) => {
              const i = row * 5 + col;
              return (
                <CountItem
                  key={i}
                  emoji={item.emoji}
                  color={color}
                  order={counted.includes(i) ? counted.indexOf(i) + 1 : null}
                  onPress={() => onCount(i)}
                />
              );
            })}
          </View>
        ))}
      </View>

      <Text style={[styles.tip, responsiveStyles.tip]}>
        {done ? "Great counting! 🎉" : "Tap each picture to count 👆"}
      </Text>
    </Animated.View>
  );
}

export function NumbersScreen() {
  const help = useHowToPlay("numbers");
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
    <>
      <GameScreen title="🔢 123" subtitle="Learn to count" onHelp={help.open}>
        <Text style={[styles.progress, responsiveStyles.progress]}>
          {index + 1} / {numbers.length}
        </Text>

        <View style={styles.stage}>
          <NumberCard
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
            onPress={() => speak(`${CAPITAL(item.word)}. Can you count them?`)}
          >
            <Text style={[styles.speakerText, responsiveStyles.speakerText]}>
              🔊
            </Text>
          </PressableScale>

          <PressableScale
            style={[
              styles.navButton,
              responsiveStyles.navButton,
              index === numbers.length - 1 && styles.navDisabled,
            ]}
            disabled={index === numbers.length - 1}
            haptic={false}
            onPress={() => go(1)}
          >
            <Text style={[styles.navText, responsiveStyles.navText]}>▶</Text>
          </PressableScale>
        </View>
      </GameScreen>
      <HowToPlayOverlay
        id="numbers"
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
  numeral: { ...typography.title },
  word: { ...typography.title, color: colors.text },
  items: {
    flexDirection: "column",
    justifyContent: "center",
  },
  tip: {
    ...typography.body,
    color: colors.teal,
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
