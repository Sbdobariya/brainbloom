import { haptic, playSound } from "@/core/audio/feedback";
import { useProgress } from "@/core/store/progress";
import { colors, gradients, radius, spacing, typography } from "@/core/theme";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { GradientButton } from "./GradientButton";
import { PressableScale } from "./PressableScale";

export type Pack = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  from: number; // first level number in this pack
  count: number; // how many levels
  hint: string; // e.g. '5×5 boards'
};

type TileProps = {
  level: number;
  size: number;
  color: string;
  stars: number;
  locked: boolean;
  current: boolean;
  index: number;
  onPress: () => void;
};

function LevelTile({
  level,
  size,
  color,
  stars,
  locked,
  current,
  index,
  onPress,
}: TileProps) {
  const enter = useSharedValue(0);
  const wobble = useSharedValue(0);
  const pulse = useSharedValue(1);

  // Tiles pop in one after another (capped so big packs don't take forever)
  useEffect(() => {
    enter.value = withDelay(
      Math.min(index, 24) * 22,
      withSpring(1, { damping: 12, stiffness: 170 }),
    );
  }, [index, enter]);

  // The level to play next breathes gently so kids know where to tap
  useEffect(() => {
    if (current) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 700 }),
          withTiming(1, { duration: 700 }),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = 1;
    }
    return () => cancelAnimation(pulse);
  }, [current, pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { scale: (0.6 + enter.value * 0.4) * pulse.value },
      { translateX: wobble.value },
    ],
  }));

  const press = () => {
    if (locked) {
      // A locked level just wiggles. No scary sound.
      wobble.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 80 }),
        withTiming(-4, { duration: 60 }),
        withTiming(0, { duration: 50 }),
      );
      haptic.tap();
      return;
    }
    playSound("tap");
    onPress();
  };

  return (
    <Animated.View style={[{ width: size, height: size * 1.1 }, style]}>
      <PressableScale
        haptic={false}
        scaleTo={0.92}
        onPress={press}
        style={[
          styles.tile,
          { borderColor: locked ? colors.cardBorder : color },
          stars > 0 && { backgroundColor: color + "33" },
          current && { backgroundColor: color },
          locked && styles.locked,
        ]}
      >
        {locked ? (
          <Text style={styles.lock}>🔒</Text>
        ) : (
          <>
            <Text style={[styles.num, current && { color: colors.bg }]}>
              {level}
            </Text>
            <Text style={styles.starsRow}>
              {"★".repeat(stars)}
              <Text style={styles.starsEmpty}>{"★".repeat(3 - stars)}</Text>
            </Text>
          </>
        )}
      </PressableScale>
    </Animated.View>
  );
}

type Props = {
  gameId: string;
  packs: Pack[];
  onSelect: (level: number) => void;
};

export function LevelSelect({ gameId, packs, onSelect }: Props) {
  const { width } = useWindowDimensions();
  const levelStars = useProgress((s) => s.levelStars[gameId]) ?? {};
  const unlocked = useProgress((s) => s.unlocked[gameId]) ?? 1;
  const totalLevels = packs.reduce((n, p) => n + p.count, 0);

  // Open on the pack that contains the next level to play
  const [packIndex, setPackIndex] = useState(() => {
    const i = packs.findIndex(
      (p) => unlocked >= p.from && unlocked < p.from + p.count,
    );
    return i >= 0 ? i : packs.length - 1;
  });
  const pack = packs[packIndex];

  const COLS = width >= 600 ? 6 : 5;
  const GAP = spacing.sm;
  const contentW = Math.min(width, 560) - spacing.lg * 2;
  const tileSize = Math.floor((contentW - GAP * (COLS - 1)) / COLS);

  const levels = Array.from({ length: pack.count }, (_, i) => pack.from + i);
  const done = levels.filter((l) => (levelStars[l] ?? 0) > 0).length;
  const starSum = levels.reduce((n, l) => n + (levelStars[l] ?? 0), 0);

  return (
    <View style={styles.root}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        style={styles.tabsScroll}
      >
        {packs.map((p, i) => {
          const active = i === packIndex;
          return (
            <PressableScale
              key={p.id}
              haptic={false}
              onPress={() => {
                setPackIndex(i);
                playSound("tap");
              }}
              style={[
                styles.pill,
                active && { backgroundColor: p.color, borderColor: p.color },
              ]}
            >
              <Text style={styles.pillEmoji}>{p.emoji}</Text>
              <Text style={[styles.pillText, active && { color: colors.bg }]}>
                {p.title}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>

      <View style={styles.header}>
        <Text style={[styles.packTitle, { color: pack.color }]}>
          {pack.emoji} {pack.title}
        </Text>
        <Text style={styles.packHint}>{pack.hint}</Text>
        <Text style={styles.packProgress}>
          {done}/{pack.count} done · ★ {starSum}/{pack.count * 3}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.gridWrap}
        showsVerticalScrollIndicator={false}
      >
        {/* key remounts the grid so the pop-in replays for each pack */}
        <View key={pack.id} style={[styles.grid, { gap: GAP }]}>
          {levels.map((level, i) => (
            <LevelTile
              key={level}
              level={level}
              size={tileSize}
              color={pack.color}
              stars={levelStars[level] ?? 0}
              locked={level > unlocked}
              current={level === unlocked}
              index={i}
              onPress={() => onSelect(level)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          label={`▶ Continue · Level ${Math.min(unlocked, totalLevels)}`}
          colors={gradients.cool}
          onPress={() => onSelect(Math.min(unlocked, totalLevels))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabsScroll: { flexGrow: 0, marginTop: spacing.lg },
  tabs: { gap: spacing.sm, paddingRight: spacing.lg },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderRadius: radius.pill,
  },
  pillEmoji: { fontSize: 18 },
  pillText: { ...typography.body, color: colors.text },
  header: { alignItems: "center", marginTop: spacing.lg, gap: 2 },
  packTitle: { ...typography.title },
  packHint: { ...typography.caption, color: colors.textMuted },
  packProgress: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.xs,
  },
  gridWrap: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  tile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 2,
    borderRadius: radius.md,
  },
  locked: { opacity: 0.45 },
  lock: { fontSize: 22 },
  num: { ...typography.heading, color: colors.text },
  starsRow: { fontSize: 11, color: colors.yellow, letterSpacing: 1 },
  starsEmpty: { color: colors.cardBorder },
  footer: { paddingBottom: spacing.xl, paddingTop: spacing.sm },
});
