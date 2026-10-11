import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/core/theme";
import { PressableScale } from "./PressableScale";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function GameHeader({ title, subtitle, onBack, right }: Props) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <PressableScale onPress={onBack} style={styles.slot}>
          <View style={styles.backButton}>
            <Text style={styles.backLabel}>{"<"}</Text>
          </View>
        </PressableScale>
      ) : (
        <View style={styles.slot} />
      )}
      <View style={styles.titleContainer}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.slot}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  slot: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    width: 48,
    height: 48,
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
