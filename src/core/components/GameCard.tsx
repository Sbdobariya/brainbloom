import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { PressableScale } from "./PressableScale";

type Props = {
  title: string;
  emoji: string;
  gradient: readonly [string, string];
  stars?: number;
  locked?: boolean;
  index: number; // position in the grid, used to stagger the entrance
  width?: number | string;
  onPress: () => void;
};

export function GameCard({
  title,
  emoji,
  gradient,
  stars,
  locked,
  index,
  width,
  onPress,
}: Props) {
  const { cardWidth, s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    wrapper: {
      width: (width ?? cardWidth) as ViewStyle["width"],
      marginBottom: s(spacing.lg),
    } as ViewStyle,
    card: {
      minHeight: s(150),
      borderRadius: s(radius.lg),
      padding: s(spacing.lg),
    } as ViewStyle,
    emoji: { fontSize: s(44) } as TextStyle,
    badge: {
      top: s(spacing.md),
      right: s(spacing.md),
      paddingHorizontal: s(spacing.sm),
      paddingVertical: s(spacing.xs),
    } as ViewStyle,
    title: { fontSize: s(typography.heading.fontSize) } as TextStyle,
    stars: { fontSize: s(typography.caption.fontSize) } as TextStyle,
    badgeText: { fontSize: s(typography.caption.fontSize) } as TextStyle,
  });
  const progress = useSharedValue(0);

  useEffect(() => {
    // withDelay makes each card start a little after the previous one
    progress.value = withDelay(
      index * 90,
      withSpring(1, { damping: 12, stiffness: 120 }),
    );
  }, [index, progress]);

  const entrance = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 40 },
      { scale: 0.8 + progress.value * 0.2 },
    ],
  }));

  return (
    <Animated.View style={[responsiveStyles.wrapper, entrance]}>
      <PressableScale onPress={onPress} style={styles.pressable}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, responsiveStyles.card, locked && styles.locked]}
        >
          <Text style={responsiveStyles.emoji}>{emoji}</Text>
          <Text
            style={[styles.title, responsiveStyles.title]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {title}
          </Text>
          {stars !== undefined && stars > 0 && (
            <Text style={[styles.stars, responsiveStyles.stars]}>
              {stars}/3 ⭐
            </Text>
          )}
          {locked && (
            <View style={[styles.badge, responsiveStyles.badge]}>
              <Text style={[styles.badgeText, responsiveStyles.badgeText]}>
                Soon
              </Text>
            </View>
          )}
        </LinearGradient>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: { width: "100%" },
  card: {
    justifyContent: "space-between",
  },
  locked: { opacity: 0.6 },
  title: { ...typography.heading, color: colors.text },
  stars: { ...typography.caption, color: colors.text },
  badge: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: radius.pill,
  },
  badgeText: { ...typography.caption, color: colors.text },
});
