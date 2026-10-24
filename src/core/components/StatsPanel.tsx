import { selectTotalStars, useProgress } from "@/core/store/progress";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { StyleSheet, Text, View } from "react-native";

export function StatsPanel() {
  const { s } = useResponsive();
  const totalStars = useProgress(selectTotalStars);
  const streak = useProgress((state) => state.streak);
  const responsiveStyles = StyleSheet.create({
    panel: {
      gap: s(spacing.md),
      padding: s(spacing.md),
      borderRadius: s(radius.lg),
      borderWidth: s(1),
    },
    item: { gap: s(spacing.sm) },
    icon: { fontSize: s(32) },
    label: { fontSize: s(typography.caption.fontSize) },
    value: { fontSize: s(typography.heading.fontSize) },
  });

  return (
    <View style={[styles.panel, responsiveStyles.panel]}>
      <View style={[styles.item, responsiveStyles.item]}>
        <Text style={[styles.icon, responsiveStyles.icon]}>⭐</Text>
        <View style={styles.copy}>
          <Text style={[styles.label, responsiveStyles.label]}>STARS</Text>
          <Text style={[styles.value, responsiveStyles.value]}>
            {totalStars}
          </Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={[styles.item, responsiveStyles.item]}>
        <Text style={[styles.icon, responsiveStyles.icon]}>🔥</Text>
        <View style={styles.copy}>
          <Text style={[styles.label, responsiveStyles.label]}>STREAK</Text>
          <Text style={[styles.value, responsiveStyles.value]}>
            {streak} {streak === 1 ? "Day" : "Days"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  },
  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  copy: { flex: 1 },
  icon: {},
  label: { ...typography.caption, color: colors.textMuted },
  value: { ...typography.heading, color: colors.yellow },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: colors.cardBorder,
  },
});
