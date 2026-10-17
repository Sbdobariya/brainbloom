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
import { colorItems, type ColorItem } from "../data/colors";

const sayIt = (item: ColorItem) =>
  speak(`${item.name}. ${item.name}, like a ${item.thing}`);

type CardProps = { item: ColorItem; dir: 1 | -1; audioEnabled: boolean };

function ColorCard({ item, dir, audioEnabled }: CardProps) {
  const { s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    card: {
      gap: s(spacing.sm),
      paddingVertical: s(spacing.xl),
      paddingHorizontal: s(spacing.lg),
      borderWidth: s(3),
      borderRadius: s(radius.lg),
    },
    emoji: { fontSize: s(80) },
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
  const circleSize = Math.max(120, s(190));

  useEffect(() => {
    x.value = withSpring(0, { damping: 16, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 220 });
    if (audioEnabled) sayIt(item);
  }, [item, x, opacity, audioEnabled]);

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
    <Animated.View
      style={[
        styles.card,
        responsiveStyles.card,
        { borderColor: item.hex },
        cardStyle,
      ]}
    >
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
            <Text style={[styles.emoji, responsiveStyles.emoji]}>
              {item.emoji}
            </Text>
          </View>
        </Animated.View>
      </PressableScale>
      <Text
        style={[styles.name, responsiveStyles.name, { color: item.hex }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {item.name}
      </Text>
      <Text
        style={[styles.fact, responsiveStyles.fact]}
      >{`${item.name}, like a ${item.thing}`}</Text>
      <Text style={[styles.tapHint, responsiveStyles.tapHint]}>
        Tap the color to hear it again 🔊
      </Text>
    </Animated.View>
  );
}

export function ColorsScreen() {
  const help = useHowToPlay("colors");
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

  const item = colorItems[index];

  const go = (step: 1 | -1) => {
    const next = index + step;
    if (next < 0 || next >= colorItems.length) return;
    setDir(step);
    setIndex(next);
    playSound("tap");
  };

  return (
    <>
      <GameScreen
        title="🌈 Colors"
        subtitle="Learn the colors"
        onHelp={help.open}
      >
        <Text style={[styles.progress, responsiveStyles.progress]}>
          {index + 1} / {colorItems.length}
        </Text>

        <View style={styles.stage}>
          <ColorCard
            key={index}
            item={item}
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
              index === colorItems.length - 1 && styles.navDisabled,
            ]}
            disabled={index === colorItems.length - 1}
            haptic={false}
            onPress={() => go(1)}
          >
            <Text style={[styles.navText, responsiveStyles.navText]}>▶</Text>
          </PressableScale>
        </View>
      </GameScreen>
      <HowToPlayOverlay
        id="colors"
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
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {},
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
