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
};

export function GameHeader({ title, subtitle, onBack, right }: Props) {
  const { s } = useResponsive();
  const buttonSize = Math.max(MIN_TOUCH, s(48));
  const responsiveStyles = StyleSheet.create({
    backLabel: { fontSize: s(typography.heading.fontSize) },
    title: { fontSize: s(typography.heading.fontSize) },
    subtitle: { fontSize: s(typography.caption.fontSize) },
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
      <View style={[styles.slot, { width: buttonSize, height: buttonSize }]}>
        {right}
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
});
