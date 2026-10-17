import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { GradientButton } from "./GradientButton";
import { PressableScale } from "./PressableScale";
import { StarsRow } from "./StarsRow";

type Props = {
  kind: "win" | "lose" | "draw";
  title: string;
  subtitle?: string;
  onPlayAgain: () => void;
  onExit: () => void;
  playAgainLabel?: string;
  stars?: number;
};

const animations = {
  win: require("../../../assets/lottie/win.json"),
  lose: require("../../../assets/lottie/lose.json"),
  draw: require("../../../assets/lottie/win.json"),
};

export function ResultModal({
  kind,
  title,
  subtitle,
  onPlayAgain,
  onExit,
  playAgainLabel = "Play again",
  stars,
}: Props) {
  const { height, width, s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    backdrop: { padding: s(spacing.xl) },
    card: {
      width: "100%",
      maxWidth: Math.min(s(360), width - s(spacing.xl) * 2),
      maxHeight: height - s(spacing.xl) * 2,
      padding: s(spacing.xl),
      borderRadius: s(radius.lg),
    },
    content: { alignItems: "center", paddingBottom: s(spacing.xs) },
    lottie: { width: s(180), height: s(180) },
    subtitle: { marginTop: s(spacing.sm) },
    actions: { gap: s(spacing.md), marginTop: s(spacing.xl) },
    exit: { minHeight: Math.max(56, s(48)), borderRadius: s(radius.lg) },
  });
  const backdrop = useSharedValue(0);
  const card = useSharedValue(0);

  // Runs once when the modal mounts: fade the backdrop, then spring the card in
  useEffect(() => {
    backdrop.value = withTiming(1, { duration: 250 });
    card.value = withSpring(1, { damping: 12, stiffness: 140 });
  }, [backdrop, card]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: card.value,
    transform: [{ scale: 0.7 + card.value * 0.3 }],
  }));

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.backdrop,
        responsiveStyles.backdrop,
        backdropStyle,
      ]}
    >
      <Animated.View style={[styles.card, responsiveStyles.card, cardStyle]}>
        <ScrollView contentContainerStyle={responsiveStyles.content}>
          <LottieView
            source={animations[kind]}
            autoPlay
            loop={kind !== "win"}
            style={[styles.lottie, responsiveStyles.lottie]}
          />
          <Text style={styles.title}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, responsiveStyles.subtitle]}>
              {subtitle}
            </Text>
          ) : null}
          {stars !== undefined && <StarsRow stars={stars} />}
          <View style={[styles.actions, responsiveStyles.actions]}>
            <GradientButton label={playAgainLabel} onPress={onPlayAgain} />
            <PressableScale
              onPress={onExit}
              sound
              style={[styles.exit, responsiveStyles.exit]}
            >
              <Text style={styles.exitText}>Exit</Text>
            </PressableScale>
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(5,8,25,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    alignItems: "center",
  },
  lottie: {},
  title: { ...typography.title, color: colors.text, textAlign: "center" },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  actions: { width: "100%" },
  exit: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  exitText: { ...typography.heading, color: colors.textMuted },
});
