import { AnimatedBackground, GameCard } from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { games } from "@/core/data/games";
import { learnModules } from "@/core/data/learn";
import { selectTotalStars, useProgress } from "@/core/store/progress";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { Href, router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { columns, cardWidth, gap, padding, contentWidth, s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    content: {
      maxWidth: contentWidth,
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: padding,
      paddingTop: s(spacing.md),
      paddingBottom: s(spacing.lg),
    },
    settingsButton: {
      top: s(spacing.sm),
      right: padding,
      width: Math.max(56, s(48)),
      height: Math.max(56, s(48)),
      borderRadius: s(radius.pill),
    },
    header: { marginBottom: s(spacing.lg) },
    statsPanel: {
      gap: s(spacing.md),
      padding: s(spacing.md),
      marginBottom: s(spacing.xl),
      borderRadius: s(radius.lg),
      borderWidth: s(1),
    },
    statItem: { gap: s(spacing.sm) },
    statIcon: { fontSize: s(32) },
    statLabel: { fontSize: s(typography.caption.fontSize) },
    statValue: { fontSize: s(typography.heading.fontSize) },
    sectionRow: { marginBottom: s(spacing.md) },
    learnHeadingRow: { marginBottom: s(spacing.md) },
    learnScroll: { marginHorizontal: -padding },
    learnContent: { gap, paddingLeft: padding, paddingRight: padding },
    grid: {
      flexDirection: "column",
      width: cardWidth * columns + gap * (columns - 1),
      columnGap: gap,
    },
    titleText: { fontSize: s(typography.title.fontSize) },
    subtitleText: { fontSize: s(typography.body.fontSize) },
    sectionText: { fontSize: s(typography.heading.fontSize) },
    learnHintText: { fontSize: s(typography.caption.fontSize) },
    settingsIcon: { fontSize: s(typography.heading.fontSize) },
    gridRow: { flexDirection: "row", columnGap: gap },
  });
  const totalStars = useProgress(selectTotalStars);
  const stars = useProgress((state) => state.stars);
  const streak = useProgress((state) => state.streak);
  const gameRows = Array.from(
    { length: Math.ceil(games.length / columns) },
    (_, row) => games.slice(row * columns, (row + 1) * columns),
  );

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.content, responsiveStyles.content]}>
            <View style={[styles.header, responsiveStyles.header]}>
              <Text
                style={[styles.title, responsiveStyles.titleText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                BrainBloom 🌱
              </Text>
              <Text
                style={[styles.subtitle, responsiveStyles.subtitleText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Let’s play and explore!
              </Text>
            </View>
            <View style={[styles.statsPanel, responsiveStyles.statsPanel]}>
              <View style={[styles.statItem, responsiveStyles.statItem]}>
                <Text style={[styles.statIcon, responsiveStyles.statIcon]}>
                  ⭐
                </Text>
                <View style={styles.statCopy}>
                  <Text style={[styles.statLabel, responsiveStyles.statLabel]}>
                    STARS
                  </Text>
                  <Text style={[styles.statValue, responsiveStyles.statValue]}>
                    {totalStars}
                  </Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={[styles.statItem, responsiveStyles.statItem]}>
                <Text style={[styles.statIcon, responsiveStyles.statIcon]}>
                  🔥
                </Text>
                <View style={styles.statCopy}>
                  <Text style={[styles.statLabel, responsiveStyles.statLabel]}>
                    STREAK
                  </Text>
                  <Text style={[styles.statValue, responsiveStyles.statValue]}>
                    {streak} {streak === 1 ? "Day" : "Days"}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={[styles.learnHeadingRow, responsiveStyles.learnHeadingRow]}
            >
              <Text
                style={[styles.sectionHeading, responsiveStyles.sectionText]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                📚 Learn & Explore
              </Text>
              <Text style={[styles.learnHint, responsiveStyles.learnHintText]}>
                Swipe ›
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={cardWidth + gap}
              contentContainerStyle={[
                styles.learnContent,
                responsiveStyles.learnContent,
              ]}
              style={[styles.learnScroll, responsiveStyles.learnScroll]}
            >
              {learnModules.map((module, i) => (
                <GameCard
                  key={module.id}
                  title={module.title}
                  emoji={module.emoji}
                  gradient={module.gradient}
                  category={module.category}
                  subtitle={module.subtitle}
                  stars={stars[module.id] ?? 0}
                  locked={!module.ready}
                  index={i}
                  width={cardWidth}
                  onPress={() =>
                    module.ready && router.push(module.route as Href)
                  }
                />
              ))}
            </ScrollView>
            <View style={[styles.sectionRow, responsiveStyles.sectionRow]}>
              <Text
                style={[styles.sectionHeading, responsiveStyles.sectionText]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                🎮 Mini Games Arcade
              </Text>
            </View>
            <View style={[styles.grid, responsiveStyles.grid]}>
              {gameRows.map((row, rowIndex) => (
                <View key={rowIndex} style={responsiveStyles.gridRow}>
                  {row.map((g, colIndex) => {
                    const index = rowIndex * columns + colIndex;
                    return (
                      <GameCard
                        key={g.id}
                        title={g.title}
                        emoji={g.emoji}
                        gradient={g.gradient}
                        category={g.category}
                        subtitle={g.subtitle}
                        stars={stars[g.id] ?? 0}
                        locked={!g.ready}
                        index={index}
                        width={cardWidth}
                        onPress={() => g.ready && router.push(g.route as Href)}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
        <PressableScale
          style={[styles.settingsButton, responsiveStyles.settingsButton]}
          onPress={() => router.push("/settings")}
        >
          <Text style={[styles.settingsIcon, responsiveStyles.settingsIcon]}>
            ⚙️
          </Text>
        </PressableScale>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {},
  settingsButton: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  settingsIcon: { ...typography.heading, color: colors.text },
  sectionHeading: {
    ...typography.heading,
    color: colors.text,
    textAlign: "left",
    flex: 1,
  },
  header: {},
  sectionRow: { flexDirection: "row", alignItems: "center" },
  learnHeadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  learnHint: { ...typography.caption, color: colors.textMuted },
  learnScroll: {},
  learnContent: {},
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: "left",
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "left",
  },
  statsPanel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  statCopy: { flex: 1 },
  statIcon: {},
  statLabel: { ...typography.caption, color: colors.textMuted },
  statValue: { ...typography.heading, color: colors.yellow },
  statDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: colors.cardBorder,
  },
  grid: {},
});
