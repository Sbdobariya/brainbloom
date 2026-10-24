import {
  AnimatedBackground,
  GameCard,
  renderGameIcon,
} from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { games } from "@/core/data/games";
import { learnModules } from "@/core/data/learn";
import { useProgress } from "@/core/store/progress";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { Href, router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { columns, cardWidth, gap, padding, contentWidth, s } = useResponsive();
  const gameColumns = Math.min(columns, 2);
  const gameCardWidth =
    gameColumns === columns
      ? cardWidth
      : Math.floor(
          (contentWidth - padding * 2 - gap * (gameColumns - 1)) / gameColumns,
        );
  const responsiveStyles = StyleSheet.create({
    content: {
      maxWidth: contentWidth,
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: padding,
      paddingBottom: s(spacing.lg),
    },
    stickyHeader: {
      width: "100%",
      maxWidth: contentWidth,
      alignSelf: "center",
      paddingHorizontal: padding,
      paddingTop: s(spacing.md),
      paddingBottom: s(spacing.sm),
    },
    header: { marginBottom: s(spacing.lg) },
    sectionRow: { gap: s(spacing.sm), marginBottom: s(spacing.md) },
    viewAll: {
      minHeight: Math.max(48, s(48)),
      paddingHorizontal: s(spacing.md),
      borderRadius: s(radius.pill),
      borderWidth: s(1),
    },
    viewAllText: { fontSize: s(typography.caption.fontSize) },
    learnHeadingRow: { marginBottom: s(spacing.md) },
    learnScroll: { marginHorizontal: -padding },
    learnContent: { gap, paddingLeft: padding, paddingRight: padding },
    grid: {
      flexDirection: "column",
      width: gameCardWidth * gameColumns + gap * (gameColumns - 1),
      columnGap: gap,
    },
    titleText: { fontSize: s(typography.title.fontSize) },
    subtitleText: { fontSize: s(typography.body.fontSize) },
    sectionText: { fontSize: s(typography.heading.fontSize) },
    gridRow: { flexDirection: "row", columnGap: gap },
  });
  const stars = useProgress((state) => state.stars);
  const visibleLessons = learnModules.slice(0, 4);
  const visibleGames = games.slice(0, 4);
  const gameRows = Array.from(
    { length: Math.ceil(visibleGames.length / gameColumns) },
    (_, row) => visibleGames.slice(row * gameColumns, (row + 1) * gameColumns),
  );

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={[styles.stickyHeader, responsiveStyles.stickyHeader]}>
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
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.content, responsiveStyles.content]}>
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
              <PressableScale
                haptic={false}
                onPress={() =>
                  router.navigate({
                    pathname: "/explore",
                    params: { tab: "learn" },
                  })
                }
                style={[styles.viewAll, responsiveStyles.viewAll]}
              >
                <Text style={[styles.learnHint, responsiveStyles.viewAllText]}>
                  View All
                </Text>
              </PressableScale>
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
              {visibleLessons.map((module, i) => (
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
                🎮 Mini Games
              </Text>
              <PressableScale
                haptic={false}
                onPress={() =>
                  router.navigate({
                    pathname: "/explore",
                    params: { tab: "games" },
                  })
                }
                style={[styles.viewAll, responsiveStyles.viewAll]}
              >
                <Text style={[styles.learnHint, responsiveStyles.viewAllText]}>
                  View All
                </Text>
              </PressableScale>
            </View>
            <View style={[styles.grid, responsiveStyles.grid]}>
              {gameRows.map((row, rowIndex) => (
                <View key={rowIndex} style={responsiveStyles.gridRow}>
                  {row.map((g, colIndex) => {
                    const index = rowIndex * gameColumns + colIndex;
                    const isLevelGame =
                      g.id === "freeFlow" || g.id === "waterSort";
                    // TODO: show "N levels done" for level-based games later.
                    return (
                      <GameCard
                        key={g.id}
                        title={g.title}
                        emoji={g.emoji}
                        icon={renderGameIcon(g.icon, s(56))}
                        gradient={g.gradient}
                        category={g.category}
                        subtitle={g.subtitle}
                        stars={isLevelGame ? 0 : (stars[g.id] ?? 0)}
                        locked={!g.ready}
                        index={index}
                        width={gameCardWidth}
                        onPress={() => g.ready && router.push(g.route as Href)}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
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
  stickyHeader: {},
  sectionHeading: {
    ...typography.heading,
    color: colors.text,
    textAlign: "left",
    flex: 1,
  },
  header: {},
  sectionRow: { flexDirection: "row", alignItems: "center" },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  },
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
  grid: {},
});
