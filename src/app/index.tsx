import { AnimatedBackground, GameCard, StatChip } from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { games } from "@/core/data/games";
import { learnModules } from "@/core/data/learn";
import { selectTotalStars, useProgress } from "@/core/store/progress";
import { colors, radius, spacing, typography } from "@/core/theme";
import { Href, router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const cardWidth = 150;
  const totalStars = useProgress(selectTotalStars);
  const stars = useProgress((state) => state.stars);
  const streak = useProgress((state) => state.streak);

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>BrainBloom</Text>
          <Text style={styles.subtitle}>Pick a game and start playing!</Text>
          <View style={styles.stats}>
            <StatChip label="TOTAL STARS" value={`⭐ ${totalStars}`} />
            <StatChip
              label="DAILY STREAK"
              value={`🔥 ${streak} ${streak === 1 ? "day" : "days"}`}
            />
          </View>
          <View style={styles.learnHeadingRow}>
            <Text style={[styles.sectionHeading, styles.learnHeading]}>
              📚 Learn
            </Text>
            <Text style={styles.learnHint}>Swipe →</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={cardWidth + spacing.md}
            contentContainerStyle={styles.learnContent}
            style={styles.learnScroll}
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
          <Text style={styles.sectionHeading}>🎮 Games</Text>
          <View style={styles.grid}>
            {games.map((g, i) => (
              <GameCard
                key={g.id}
                title={g.title}
                emoji={g.emoji}
                gradient={g.gradient}
                stars={stars[g.id] ?? 0}
                locked={!g.ready}
                index={i}
                onPress={() => g.ready && router.push(g.route as Href)}
              />
            ))}
          </View>
        </ScrollView>
        <PressableScale
          style={styles.settingsButton}
          onPress={() => router.push("/settings")}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </PressableScale>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg },
  settingsButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.lg,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  settingsIcon: { ...typography.heading, color: colors.text },
  sectionHeading: {
    ...typography.heading,
    color: colors.text,
    textAlign: "left",
    marginBottom: spacing.md,
  },
  learnHeadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  learnHeading: { marginBottom: 0 },
  learnHint: { ...typography.caption, color: colors.textMuted },
  learnScroll: { marginHorizontal: -spacing.lg },
  learnContent: { gap: spacing.md, paddingRight: spacing.lg },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
