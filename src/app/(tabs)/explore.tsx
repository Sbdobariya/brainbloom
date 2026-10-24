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
import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ExploreTab = "learn" | "games";

export default function ExploreScreen() {
  const { columns, cardWidth, gap, padding, contentWidth, s } = useResponsive();
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const requestedTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const [selectedTab, setSelectedTab] = useState<ExploreTab>(
    requestedTab === "games" ? "games" : "learn",
  );
  const stars = useProgress((state) => state.stars);
  const responsiveStyles = StyleSheet.create({
    content: {
      width: "100%",
      maxWidth: contentWidth,
      alignSelf: "center",
      paddingHorizontal: padding,
      gap: s(spacing.lg),
    },
    stickyHeader: {
      width: "100%",
      maxWidth: contentWidth,
      alignSelf: "center",
      paddingHorizontal: padding,
      paddingTop: s(spacing.lg),
      paddingBottom: s(spacing.md),
      gap: s(spacing.md),
    },
    heading: { fontSize: s(typography.title.fontSize) },
    tabs: { gap: s(spacing.sm) },
    tab: {
      minHeight: Math.max(48, s(48)),
      minWidth: Math.max(48, s(48)),
      paddingHorizontal: s(spacing.lg),
      borderRadius: s(radius.pill),
      borderWidth: s(3),
    },
    tabText: { fontSize: s(typography.body.fontSize) },
    grid: {
      width: cardWidth * columns + gap * (columns - 1),
      maxWidth: contentWidth - padding * 2,
      alignSelf: "center",
      gap,
    },
    gridRow: { flexDirection: "row", gap },
  });

  useEffect(() => {
    setSelectedTab(requestedTab === "games" ? "games" : "learn");
  }, [requestedTab]);

  const entries = selectedTab === "learn" ? learnModules : games;
  const rows = Array.from(
    { length: Math.ceil(entries.length / columns) },
    (_, row) => entries.slice(row * columns, (row + 1) * columns),
  );

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={[styles.stickyHeader, responsiveStyles.stickyHeader]}>
          <Text
            style={[styles.heading, responsiveStyles.heading]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            🧩 Explore
          </Text>
          <View style={[styles.tabs, responsiveStyles.tabs]}>
            <PressableScale
              haptic={false}
              onPress={() => setSelectedTab("learn")}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedTab === "learn" }}
              style={[
                styles.tab,
                responsiveStyles.tab,
                selectedTab === "learn"
                  ? styles.learnSelected
                  : styles.unselected,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  responsiveStyles.tabText,
                  selectedTab === "learn" && styles.selectedText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                📚 Learn
              </Text>
            </PressableScale>
            <PressableScale
              haptic={false}
              onPress={() => setSelectedTab("games")}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedTab === "games" }}
              style={[
                styles.tab,
                responsiveStyles.tab,
                selectedTab === "games"
                  ? styles.gamesSelected
                  : styles.unselected,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  responsiveStyles.tabText,
                  selectedTab === "games" && styles.selectedText,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                🎮 Games
              </Text>
            </PressableScale>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.content, responsiveStyles.content]}>
            <View style={[styles.grid, responsiveStyles.grid]}>
              {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={responsiveStyles.gridRow}>
                  {row.map((entry, columnIndex) => {
                    const index = rowIndex * columns + columnIndex;
                    const isLevelGame =
                      entry.id === "freeFlow" || entry.id === "waterSort";
                    const gameEntry = entry as (typeof games)[number];
                    // TODO: show "N levels done" for level-based games later.
                    return (
                      <GameCard
                        key={entry.id}
                        title={entry.title}
                        emoji={entry.emoji}
                        icon={
                          selectedTab === "games"
                            ? renderGameIcon(gameEntry.icon, s(56))
                            : undefined
                        }
                        gradient={entry.gradient}
                        category={entry.category}
                        subtitle={entry.subtitle}
                        stars={isLevelGame ? 0 : (stars[entry.id] ?? 0)}
                        locked={!entry.ready}
                        index={index}
                        width={cardWidth}
                        onPress={() =>
                          entry.ready && router.push(entry.route as Href)
                        }
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
  heading: { ...typography.title, color: colors.text },
  tabs: { flexDirection: "row" },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  learnSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  gamesSelected: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  unselected: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  },
  tabText: { ...typography.body, color: colors.textMuted },
  selectedText: { color: colors.text },
  grid: { flexDirection: "column" },
});
