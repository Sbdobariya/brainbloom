import {
  AnimatedBackground,
  GradientButton,
  StatsPanel,
} from "@/core/components";
import { games } from "@/core/data/games";
import { learnModules } from "@/core/data/learn";
import { useProgress } from "@/core/store/progress";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const entries = [...games, ...learnModules];

export default function MeScreen() {
  const { contentWidth, padding, s } = useResponsive();
  const stars = useProgress((state) => state.stars);
  const responsiveStyles = StyleSheet.create({
    content: {
      width: "100%",
      maxWidth: contentWidth,
      alignSelf: "center",
      paddingHorizontal: padding,
      paddingTop: s(spacing.lg),
      paddingBottom: s(spacing.xl),
      gap: s(spacing.lg),
    },
    heading: { fontSize: s(typography.title.fontSize) },
    profile: {
      padding: s(spacing.xl),
      gap: s(spacing.sm),
      borderRadius: s(radius.lg),
    },
    fox: { fontSize: s(72) },
    name: { fontSize: s(typography.heading.fontSize) },
    section: {
      padding: s(spacing.lg),
      borderRadius: s(radius.lg),
      gap: s(spacing.md),
    },
    sectionTitle: { fontSize: s(typography.heading.fontSize) },
    row: {
      minHeight: Math.max(56, s(56)),
      gap: s(spacing.sm),
      paddingVertical: s(spacing.xs),
      borderBottomWidth: s(1),
    },
    rowEmoji: { fontSize: s(24), width: s(36) },
    rowTitle: { fontSize: s(typography.body.fontSize) },
    rowStars: { fontSize: s(typography.body.fontSize) },
  });

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.content, responsiveStyles.content]}>
            <Text
              style={[styles.heading, responsiveStyles.heading]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              🦊 Me
            </Text>

            <View style={[styles.profile, responsiveStyles.profile]}>
              <Text style={[styles.fox, responsiveStyles.fox]}>🦊</Text>
              <Text
                style={[styles.name, responsiveStyles.name]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Young Explorer
              </Text>
              <StatsPanel />
            </View>

            <View style={[styles.section, responsiveStyles.section]}>
              <Text
                style={[styles.sectionTitle, responsiveStyles.sectionTitle]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Your best stars
              </Text>
              {entries.map((entry) => {
                const earned = Math.max(0, Math.min(3, stars[entry.id] ?? 0));
                return (
                  <View
                    key={entry.id}
                    style={[styles.row, responsiveStyles.row]}
                  >
                    <Text style={[styles.rowEmoji, responsiveStyles.rowEmoji]}>
                      {entry.emoji}
                    </Text>
                    <Text
                      style={[styles.rowTitle, responsiveStyles.rowTitle]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {entry.title}
                    </Text>
                    <Text style={[styles.rowStars, responsiveStyles.rowStars]}>
                      {"⭐".repeat(earned)}
                      {"☆".repeat(3 - earned)}
                    </Text>
                  </View>
                );
              })}
            </View>

            <GradientButton
              label="⚙️ Settings"
              onPress={() => router.push("/settings")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {},
  heading: { ...typography.title, color: colors.text },
  profile: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  fox: {},
  name: { ...typography.heading, color: colors.text },
  section: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  sectionTitle: { ...typography.heading, color: colors.text },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: colors.cardBorder,
  },
  rowEmoji: {},
  rowTitle: { ...typography.body, color: colors.text, flex: 1 },
  rowStars: { color: colors.yellow, textAlign: "right" },
});
