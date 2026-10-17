import { playSound, speak } from "@/core/audio/feedback";
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
import { alphabet, type LetterItem } from "../data/alphabet";

const CARD_COLORS = [
  colors.pink,
  colors.orange,
  colors.yellow,
  colors.green,
  colors.teal,
  colors.blue,
  colors.purple,
];

const sayIt = (item: LetterItem) =>
  speak(`${item.letter}. ${item.letter} is for ${item.word}`);

type CardProps = { item: LetterItem; color: string; dir: 1 | -1 };

// This component is re-created (via key) for every letter, so its starting
// values below act as the "enter from the side" animation.
function LetterCard({ item, color, dir }: CardProps) {
  const x = useSharedValue(dir * 90);
  const opacity = useSharedValue(0);
  const bounce = useSharedValue(1);

  useEffect(() => {
    x.value = withSpring(0, { damping: 16, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 220 });
    sayIt(item); // read the letter out loud as soon as it appears
  }, [item, x, opacity]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }],
  }));
  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }],
  }));

  const onTapEmoji = () => {
    bounce.value = withSequence(
      withTiming(1.3, { duration: 120 }),
      withSpring(1, { damping: 5, stiffness: 200 }),
    );
    playSound("pop");
    sayIt(item);
  };

  return (
    <Animated.View style={[styles.card, { borderColor: color }, cardStyle]}>
      <Text style={[styles.letters, { color }]}>
        {item.letter}
        <Text style={styles.lower}>{item.letter.toLowerCase()}</Text>
      </Text>

      <PressableScale onPress={onTapEmoji} haptic={false} scaleTo={0.9}>
        <Animated.Text style={[styles.emoji, emojiStyle]}>
          {item.emoji}
        </Animated.Text>
      </PressableScale>

      <Text style={styles.word}>
        <Text style={{ color }}>{item.word[0]}</Text>
        {item.word.slice(1)}
      </Text>
      <Text style={styles.tapHint}>Tap the picture to hear it again 🔊</Text>
    </Animated.View>
  );
}

export function AlphabetScreen() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const item = alphabet[index];
  const color = CARD_COLORS[index % CARD_COLORS.length];

  const go = (step: 1 | -1) => {
    const next = index + step;
    if (next < 0 || next >= alphabet.length) return;
    setDir(step);
    setIndex(next);
    playSound("tap");
  };

  return (
    <GameScreen title="🔤 ABC" subtitle="Learn the alphabet">
      <Text style={styles.progress}>
        {index + 1} / {alphabet.length}
      </Text>

      <View style={styles.stage}>
        <LetterCard key={index} item={item} color={color} dir={dir} />
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
            index === alphabet.length - 1 && styles.navDisabled,
          ]}
          disabled={index === alphabet.length - 1}
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
    gap: spacing.md,
    paddingVertical: spacing.xl,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderRadius: radius.lg,
  },
  letters: { ...typography.title, fontSize: 96 },
  lower: { ...typography.heading, fontSize: 72 },
  emoji: { fontSize: 110 },
  word: { ...typography.title, color: colors.text },
  tapHint: { ...typography.caption, color: colors.textMuted },
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
