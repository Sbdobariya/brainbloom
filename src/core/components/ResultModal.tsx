import { colors, radius, spacing, typography } from "@/core/theme";
import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { GradientButton } from "./GradientButton";
import { PressableScale } from "./PressableScale";

type Props = {
  kind: "win" | "lose" | "draw";
  title: string;
  subtitle?: string;
  onPlayAgain: () => void;
  onExit: () => void;
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
}: Props) {
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
      style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
    >
      <Animated.View style={[styles.card, cardStyle]}>
        <LottieView
          source={animations[kind]}
          autoPlay
          loop={kind !== "win"}
          style={styles.lottie}
        />
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <View style={styles.actions}>
          <GradientButton label="Play again" onPress={onPlayAgain} />
          <PressableScale onPress={onExit} style={styles.exit}>
            <Text style={styles.exitText}>Exit</Text>
          </PressableScale>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(5,8,25,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  lottie: { width: 180, height: 180 },
  title: { ...typography.title, color: colors.text, textAlign: "center" },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  actions: { width: "100%", gap: spacing.md, marginTop: spacing.xl },
  exit: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  exitText: { ...typography.heading, color: colors.textMuted },
});
