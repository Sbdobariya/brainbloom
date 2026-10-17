import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, MIN_TOUCH, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { PressableScale } from "./PressableScale";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  onHelp?: () => void;
};

export function GameHeader({ title, subtitle, onBack, right, onHelp }: Props) {
  const { s } = useResponsive();
  const buttonSize = Math.max(MIN_TOUCH, s(48));
  const rightSlotWidth =
    buttonSize * (onHelp && right ? 2 : 1) +
    (onHelp && right ? s(spacing.xs) : 0);
  const responsiveStyles = StyleSheet.create({
    backLabel: { fontSize: s(typography.heading.fontSize) },
    title: { fontSize: s(typography.heading.fontSize) },
    subtitle: { fontSize: s(typography.caption.fontSize) },
    helpButton: { width: buttonSize, height: buttonSize },
    helpText: { fontSize: s(typography.heading.fontSize) },
    rightSlot: {
      width: rightSlotWidth,
      flexDirection: "row",
      gap: s(spacing.xs),
    },
  });

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: s(spacing.lg),
          paddingVertical: s(spacing.md),
          gap: s(spacing.sm),
        },
      ]}
    >
      {onBack ? (
        <PressableScale
          onPress={onBack}
          style={[styles.slot, { width: buttonSize, height: buttonSize }]}
        >
          <View
            style={[
              styles.backButton,
              { width: buttonSize, height: buttonSize },
            ]}
          >
            <Text style={[styles.backLabel, responsiveStyles.backLabel]}>
              {"<"}
            </Text>
          </View>
        </PressableScale>
      ) : (
        <View
          style={[styles.slot, { width: buttonSize, height: buttonSize }]}
        />
      )}
      <View style={styles.titleContainer}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          style={[styles.title, responsiveStyles.title]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[styles.subtitle, responsiveStyles.subtitle]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.slot,
          { width: rightSlotWidth, height: buttonSize },
          responsiveStyles.rightSlot,
        ]}
      >
        {right}
        {onHelp ? (
          <PressableScale
            onPress={onHelp}
            accessibilityRole="button"
            accessibilityLabel="How to play"
            style={[styles.helpButton, responsiveStyles.helpButton]}
          >
            <Text style={[styles.helpText, responsiveStyles.helpText]}>?</Text>
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  slot: {
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  backLabel: {
    ...typography.heading,
    color: colors.text,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.heading,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  helpButton: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  helpText: { ...typography.heading, color: colors.text },
});
