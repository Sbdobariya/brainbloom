import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type Props = {
  label: string;
  value: string | number;
  color?: string;
};

export function StatChip({ label, value, color = colors.text }: Props) {
  const { s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    chip: {
      paddingVertical: s(spacing.md),
      borderRadius: s(radius.md),
      borderWidth: s(1),
    },
    label: { marginTop: s(spacing.xs) },
    valueText: { fontSize: s(typography.heading.fontSize) },
    labelText: { fontSize: s(typography.caption.fontSize) },
  });
  const scale = useSharedValue(1);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Don't animate on the first render, only when the value changes
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // withSequence runs animations one after another:
    // quick grow, then a bouncy settle back to normal
    scale.value = withSequence(
      withTiming(1.25, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 200 }),
    );
  }, [value, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.chip, responsiveStyles.chip]}>
      <Animated.Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={[
          styles.value,
          responsiveStyles.valueText,
          { color },
          animatedStyle,
        ]}
      >
        {value}
      </Animated.Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={[
          styles.label,
          responsiveStyles.label,
          responsiveStyles.labelText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  },
  value: { ...typography.heading },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
