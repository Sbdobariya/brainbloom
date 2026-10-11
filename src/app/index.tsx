import { AnimatedBackground, GameCard } from "@/core/components";
import { games } from "@/core/data/games";
import { colors, spacing, typography } from "@/core/theme";
import { Href, router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>BrainBloom</Text>
          <Text style={styles.subtitle}>Pick a game and start playing!</Text>
          <View style={styles.grid}>
            {games.map((g, i) => (
              <GameCard
                key={g.id}
                title={g.title}
                emoji={g.emoji}
                gradient={g.gradient}
                locked={!g.ready}
                index={i}
                onPress={() => g.ready && router.push(g.route as Href)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg },
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
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
