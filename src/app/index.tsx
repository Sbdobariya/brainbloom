import { AnimatedBackground, GameCard, StatChip } from "@/core/components";
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
      paddingTop: s(spacing.lg),
      paddingBottom: s(spacing.lg),
    },
    settingsButton: {
      top: s(spacing.sm),
      right: padding,
      width: Math.max(56, s(48)),
      height: Math.max(56, s(48)),
      borderRadius: s(radius.pill),
    },
    stats: { gap, marginBottom: s(spacing.xl) },
    learnHeadingRow: { marginBottom: s(spacing.md) },
    learnScroll: { marginHorizontal: -padding },
    learnContent: { gap, paddingLeft: padding, paddingRight: padding },
    grid: {
      flexDirection: "column",
      width: cardWidth * columns + gap * (columns - 1),
      columnGap: gap,
    },
    title: { marginTop: s(spacing.lg) },
    subtitle: { marginBottom: s(spacing.md) },
    sectionHeading: { marginBottom: s(spacing.md) },
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
            <Text
              style={[
                styles.title,
                responsiveStyles.title,
                responsiveStyles.titleText,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              BrainBloom
            </Text>
            <Text
              style={[
                styles.subtitle,
                responsiveStyles.subtitle,
                responsiveStyles.subtitleText,
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              Pick a game and start playing!
            </Text>
            <View style={[styles.stats, responsiveStyles.stats]}>
              <StatChip label="TOTAL STARS" value={`⭐ ${totalStars}`} />
              <StatChip
                label="DAILY STREAK"
                value={`🔥 ${streak} ${streak === 1 ? "day" : "days"}`}
              />
            </View>
            <View
              style={[styles.learnHeadingRow, responsiveStyles.learnHeadingRow]}
            >
              <Text
                style={[
                  styles.sectionHeading,
                  styles.learnHeading,
                  responsiveStyles.sectionText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                📚 Learn
              </Text>
              <Text style={[styles.learnHint, responsiveStyles.learnHintText]}>
                Swipe →
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
            <Text
              style={[
                styles.sectionHeading,
                responsiveStyles.sectionHeading,
                responsiveStyles.sectionText,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              🎮 Games
            </Text>
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
  },
  learnHeadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  learnHeading: { marginBottom: 0 },
  learnHint: { ...typography.caption, color: colors.textMuted },
  learnScroll: {},
  learnContent: {},
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  stats: {
    flexDirection: "row",
  },
  grid: {},
});
