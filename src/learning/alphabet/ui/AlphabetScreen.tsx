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

type CardProps = {
  item: LetterItem;
  color: string;
  dir: 1 | -1;
  audioEnabled: boolean;
};

// This component is re-created (via key) for every letter, so its starting
// values below act as the "enter from the side" animation.
function LetterCard({ item, color, dir, audioEnabled }: CardProps) {
  const { s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    card: {
      gap: s(spacing.md),
      paddingVertical: s(spacing.xl),
      borderWidth: s(3),
      borderRadius: s(radius.lg),
    },
    letters: { fontSize: s(96) },
    lower: { fontSize: s(72) },
    emoji: { fontSize: s(110) },
    word: { fontSize: s(typography.title.fontSize) },
    tapHint: { fontSize: s(typography.caption.fontSize) },
  });
  const x = useSharedValue(dir * 90);
  const opacity = useSharedValue(0);
  const bounce = useSharedValue(1);

  useEffect(() => {
    x.value = withSpring(0, { damping: 16, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 220 });
    if (audioEnabled) sayIt(item);
  }, [item, x, opacity, audioEnabled]);

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
    <Animated.View
      style={[
        styles.card,
        responsiveStyles.card,
        { borderColor: color },
        cardStyle,
      ]}
    >
      <Text style={[styles.letters, responsiveStyles.letters, { color }]}>
        {item.letter}
        <Text style={[styles.lower, responsiveStyles.lower]}>
          {item.letter.toLowerCase()}
        </Text>
      </Text>

      <PressableScale onPress={onTapEmoji} haptic={false} scaleTo={0.9}>
        <Animated.Text
          style={[styles.emoji, responsiveStyles.emoji, emojiStyle]}
        >
          {item.emoji}
        </Animated.Text>
      </PressableScale>

      <Text style={[styles.word, responsiveStyles.word]}>
        <Text style={{ color }}>{item.word[0]}</Text>
        {item.word.slice(1)}
      </Text>
      <Text style={[styles.tapHint, responsiveStyles.tapHint]}>
        Tap the picture to hear it again 🔊
      </Text>
    </Animated.View>
  );
}

export function AlphabetScreen() {
  const help = useHowToPlay("alphabet");
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
    <>
      <GameScreen
        title="🔤 ABC"
        subtitle="Learn the alphabet"
        onHelp={help.open}
      >
        <Text style={[styles.progress, responsiveStyles.progress]}>
          {index + 1} / {alphabet.length}
        </Text>

        <View style={styles.stage}>
          <LetterCard
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
              index === alphabet.length - 1 && styles.navDisabled,
            ]}
            disabled={index === alphabet.length - 1}
            haptic={false}
            onPress={() => go(1)}
          >
            <Text style={[styles.navText, responsiveStyles.navText]}>▶</Text>
          </PressableScale>
        </View>
      </GameScreen>
      <HowToPlayOverlay
        id="alphabet"
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
  letters: { ...typography.title },
  lower: { ...typography.heading },
  emoji: {},
  word: { ...typography.title, color: colors.text },
  tapHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
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
