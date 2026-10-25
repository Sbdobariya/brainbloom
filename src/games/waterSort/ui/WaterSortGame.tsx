import { haptic, playSound } from "@/core/audio/feedback";
import {
  GameScreen,
  GradientButton,
  HowToPlayOverlay,
  LevelSelect,
  ResultModal,
  StatChip,
} from "@/core/components";
import { useHowToPlay } from "@/core/howToPlay/useHowToPlay";
import { starsForMoves } from "@/core/logic/stars";
import { useProgress } from "@/core/store/progress";
import { colors, gradients, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WATER_SORT_LEVELS, waterSortPacks } from "../data/packs";
import {
  canPour,
  createLevel,
  getLevelConfig,
  isSolved,
  pour,
  solvedCount,
  type Tube,
} from "../logic/waterSort";
import { LiquidTube } from "./LiquidTube";

// Color id -> palette color
const PALETTE = [
  colors.red,
  colors.green,
  colors.blue,
  colors.yellow,
  colors.purple,
  colors.orange,
  colors.pink,
  colors.teal,
];

export function WaterSortGame() {
  const help = useHowToPlay("waterSort");
  const { s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    row: { gap: s(spacing.sm), marginTop: s(spacing.lg) },
    tubes: {
      columnGap: s(spacing.lg),
      rowGap: s(spacing.xl),
      marginTop: s(spacing.xxl),
      paddingTop: s(spacing.lg),
    },
    footer: { paddingBottom: s(spacing.xl) },
    skip: {
      marginTop: s(spacing.md),
      alignSelf: "center",
      paddingVertical: s(spacing.xs),
      paddingHorizontal: s(spacing.md),
    },
  });
  const [levelNo, setLevelNo] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [tubes, setTubes] = useState<Tube[]>(() => createLevel(1));
  const [history, setHistory] = useState<Tube[][]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const resultRecorded = useRef(false);

  const { colors: colorCount } = getLevelConfig(level);
  const stars = starsForMoves(moves, colorCount * 5, colorCount * 8);

  useEffect(() => {
    if (levelNo === null || !solved) {
      setShowResult(false);
      return;
    }
    haptic.success();
    const id = setTimeout(() => {
      if (!resultRecorded.current) {
        resultRecorded.current = true;
        useProgress.getState().recordLevel("waterSort", levelNo, stars);
        playSound("win");
      }
      setShowResult(true);
    }, 800);
    return () => clearTimeout(id);
  }, [levelNo, solved, stars]);

  const loadLevel = (n: number) => {
    resultRecorded.current = false;
    setLevelNo(n);
    setLevel(n);
    setTubes(createLevel(n));
    setHistory([]);
    setSelected(null);
    setMoves(0);
    setSolved(false);
    setShowResult(false);
  };

  const skipLevel = () => {
    if (levelNo === null) return;
    useProgress.getState().skipLevel("waterSort", levelNo);
    if (levelNo + 1 <= WATER_SORT_LEVELS) {
      loadLevel(levelNo + 1);
      return;
    }
    setLevelNo(null);
  };

  const onTubePress = (i: number) => {
    if (solved) return;

    if (selected === null) {
      if (tubes[i].length > 0) {
        setSelected(i);
        haptic.select();
        playSound("tap");
      }
      return;
    }

    if (selected === i) {
      setSelected(null);
      return;
    }

    if (canPour(tubes, selected, i)) {
      const next = pour(tubes, selected, i);
      setHistory((h) => [...h, tubes]);
      setTubes(next);
      setMoves((m) => m + 1);
      setSelected(null);
      haptic.tap();
      playSound("pop");
      if (isSolved(next)) setSolved(true);
      return;
    }

    if (tubes[i].length > 0) {
      setSelected(i);
      haptic.select();
      playSound("tap");
    } else {
      setSelected(null);
    }
  };

  const undo = () => {
    if (history.length === 0 || solved) return;
    setTubes(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setMoves((m) => Math.max(m - 1, 0));
    setSelected(null);
  };

  const tubeWidth = Math.max(48, s(56));
  const tubeHeight = Math.max(120, s(190));

  return (
    <>
      <GameScreen
        title="Water Sort"
        subtitle={
          levelNo === null
            ? "Choose a level"
            : `Level ${levelNo} · Sort ${colorCount} colors!`
        }
        onBack={levelNo === null ? undefined : () => setLevelNo(null)}
        onHelp={help.open}
        scrollable={levelNo !== null}
      >
        {levelNo === null ? (
          <LevelSelect
            gameId="waterSort"
            packs={waterSortPacks}
            onSelect={loadLevel}
          />
        ) : (
          <>
            <View style={[styles.row, responsiveStyles.row]}>
              <StatChip label="MOVES" value={moves} color={colors.blue} />
              <StatChip
                label="SOLVED"
                value={`${solvedCount(tubes)}/${colorCount}`}
                color={colors.green}
              />
              <StatChip label="LEVEL" value={level} color={colors.yellow} />
            </View>

            <View style={[styles.tubes, responsiveStyles.tubes]}>
              {tubes.map((tube, i) => (
                <LiquidTube
                  key={i}
                  layers={tube.map((c) => PALETTE[c % PALETTE.length])}
                  selected={selected === i}
                  width={tubeWidth}
                  height={tubeHeight}
                  onPress={() => onTubePress(i)}
                />
              ))}
            </View>

            <View style={[styles.footer, responsiveStyles.footer]}>
              <View style={[styles.row, responsiveStyles.row]}>
                <View style={styles.flex}>
                  <GradientButton
                    label="↩️ Undo"
                    colors={gradients.cool}
                    onPress={undo}
                  />
                </View>
                <View style={styles.flex}>
                  <GradientButton
                    label="🔄 Reset"
                    onPress={() => loadLevel(level)}
                  />
                </View>
              </View>

              <Text
                style={[styles.skip, responsiveStyles.skip]}
                onPress={skipLevel}
              >
                ⏭ Skip
              </Text>
            </View>

            {showResult && (
              <ResultModal
                kind="win"
                title="Level complete! 🎉"
                subtitle={`${moves} moves`}
                playAgainLabel={
                  levelNo < WATER_SORT_LEVELS ? "Next level" : "Levels"
                }
                onPlayAgain={() => {
                  if (levelNo < WATER_SORT_LEVELS) {
                    loadLevel(levelNo + 1);
                    return;
                  }
                  setLevelNo(null);
                }}
                onExit={() => router.back()}
                stars={stars}
                ads
              />
            )}
          </>
        )}
      </GameScreen>
      <HowToPlayOverlay
        id="waterSort"
        visible={help.visible}
        onClose={help.close}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  flex: { flex: 1 },
  tubes: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  footer: { flex: 1, justifyContent: "flex-end" },
  skip: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
});
