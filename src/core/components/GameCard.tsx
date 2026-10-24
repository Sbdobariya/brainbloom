import { haptic, playSound } from "@/core/audio/feedback";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

function darken(hex: string, amount: number) {
  const value = Number.parseInt(hex.slice(1), 16);
  const channel = (shift: number) =>
    Math.round(((value >> shift) & 255) * (1 - amount));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

function lighten(hex: string, amount: number) {
  const value = Number.parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const current = (value >> shift) & 255;
    return Math.round(current + (255 - current) * amount);
  };
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

type Props = {
  title: string;
  emoji: string;
  icon?: React.ReactNode;
  gradient: readonly [string, string];
  category?: string;
  subtitle?: string;
  stars?: number; // 0..3
  onPress?: () => void;
  index?: number;
  locked?: boolean;
  width?: number;
};

export function GameCard({
  title,
  emoji,
  icon,
  gradient,
  category,
  subtitle,
  stars = 0,
  onPress,
  index = 0,
  locked,
  width,
}: Props) {
  const { s } = useResponsive();
  const [pressed, setPressed] = useState(false);
  const isLocked = !!locked;
  const ledge = s(7);
  const edge = isLocked ? colors.cardBorder : darken(gradient[1], 0.34);
  const faceColors: readonly [string, string] = isLocked
    ? [colors.bgSoft, colors.cardBorder]
    : [lighten(gradient[0], 0.24), gradient[1]];
  const cardWidth = width ?? "100%";
  const responsiveStyles = StyleSheet.create({
    wrapper: {
      width: cardWidth as ViewStyle["width"],
      paddingBottom: ledge,
      marginBottom: s(spacing.md),
    } as ViewStyle,
    ledge: {
      left: 0,
      right: 0,
      top: s(8),
      bottom: 0,
      borderRadius: s(radius.lg),
      backgroundColor: edge,
    } as ViewStyle,
    face: {
      minHeight: s(232),
      padding: s(spacing.md),
      borderRadius: s(radius.lg),
      borderColor: edge,
      borderWidth: s(2),
      transform: [{ translateY: pressed && !isLocked ? ledge - s(2) : 0 }],
      shadowColor: isLocked ? colors.bg : gradient[1],
      shadowOpacity: isLocked ? 0 : 0.34,
      shadowRadius: isLocked ? 0 : s(12),
      shadowOffset: { width: 0, height: s(7) },
      elevation: isLocked ? 0 : s(8),
    } as ViewStyle,
    topRow: {
      alignSelf: "stretch",
      gap: s(spacing.xs),
      marginBottom: s(spacing.sm),
    } as ViewStyle,
    category: {
      maxWidth: s(112),
      minWidth: 0,
      flexShrink: 1,
      paddingHorizontal: s(spacing.sm),
      paddingVertical: s(spacing.xs),
      borderRadius: s(radius.pill),
    } as ViewStyle,
    categoryText: { fontSize: s(typography.caption.fontSize) } as TextStyle,
    stars: {
      gap: s(2),
      maxWidth: s(96),
      flexShrink: 0,
      paddingHorizontal: s(spacing.xs),
      paddingVertical: s(2),
      borderRadius: s(radius.pill),
    } as ViewStyle,
    star: { fontSize: s(16) } as TextStyle,
    badge: {
      width: s(80),
      height: s(80),
      borderRadius: s(40),
      borderWidth: s(4),
      marginBottom: s(spacing.sm),
    } as ViewStyle,
    emoji: { fontSize: s(46) } as TextStyle,
    title: {
      fontSize: s(typography.heading.fontSize),
      marginTop: s(spacing.xs),
    } as TextStyle,
    subtitle: {
      fontSize: s(typography.caption.fontSize),
      marginTop: s(spacing.xs),
    } as TextStyle,
  });
  const earnedStars = Math.max(0, Math.min(3, stars));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).springify()}
      style={responsiveStyles.wrapper}
    >
      <Pressable
        disabled={isLocked}
        onPressIn={() => !isLocked && setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={() => {
          if (isLocked) return;
          playSound("tap");
          haptic.tap();
          onPress?.();
        }}
        accessibilityRole="button"
        accessibilityLabel={
          isLocked
            ? `${title}, coming soon`
            : `${title}, ${earnedStars} of 3 stars`
        }
        accessibilityState={{ disabled: isLocked }}
        style={styles.pressable}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.ledge,
            responsiveStyles.ledge,
          ]}
        />
        <LinearGradient
          colors={faceColors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.face, responsiveStyles.face]}
        >
          <View style={[styles.topRow, responsiveStyles.topRow]}>
            {category ? (
              <View
                style={[
                  styles.category,
                  responsiveStyles.category,
                  {
                    backgroundColor: isLocked
                      ? colors.card
                      : "rgba(0,0,0,0.18)",
                  },
                ]}
              >
                <Text
                  style={[styles.categoryText, responsiveStyles.categoryText]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {category.toUpperCase()}
                </Text>
              </View>
            ) : (
              <View />
            )}
            {!isLocked && (
              <View style={[styles.stars, responsiveStyles.stars]}>
                {[0, 1, 2].map((star) => (
                  <Text
                    key={star}
                    style={[
                      styles.star,
                      responsiveStyles.star,
                      star >= earnedStars && styles.emptyStar,
                    ]}
                  >
                    {star < earnedStars ? "⭐" : "☆"}
                  </Text>
                ))}
              </View>
            )}
          </View>
          <View
            style={[
              styles.badge,
              responsiveStyles.badge,
              {
                borderColor: isLocked
                  ? colors.cardBorder
                  : "rgba(255,255,255,0.72)",
              },
            ]}
          >
            {icon ?? (
              <Text
                style={[
                  styles.emoji,
                  responsiveStyles.emoji,
                  isLocked && styles.lockedEmoji,
                ]}
              >
                {emoji}
              </Text>
            )}
          </View>
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[styles.title, responsiveStyles.title]}
          >
            {title}
          </Text>
          {isLocked ? (
            <Text style={[styles.subtitle, responsiveStyles.subtitle]}>
              Coming soon
            </Text>
          ) : subtitle ? (
            <Text
              style={[styles.subtitle, responsiveStyles.subtitle]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {subtitle}
            </Text>
          ) : null}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: { width: "100%" },
  face: {
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  ledge: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  emoji: {},
  lockedEmoji: { opacity: 0.4 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  category: { alignSelf: "flex-start" },
  categoryText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "700",
  },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  star: {
    color: colors.yellow,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowRadius: 2,
  },
  emptyStar: { color: colors.text, opacity: 0.9 },
  title: {
    ...typography.heading,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    ...typography.caption,
    color: "rgba(255,255,255,0.86)",
    textAlign: "center",
  },
});
