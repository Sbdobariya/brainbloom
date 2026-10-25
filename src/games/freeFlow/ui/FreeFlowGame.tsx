import { haptic, playSound } from "@/core/audio/feedback";
import {
  GameScreen,
  GradientButton,
  HowToPlayOverlay,
  LevelSelect,
  ResultModal,
  StatChip,
} from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { useHowToPlay } from "@/core/howToPlay/useHowToPlay";
import { starsForMoves } from "@/core/logic/stars";
import { useProgress } from "@/core/store/progress";
import { colors, gradients, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FREE_FLOW_LEVELS, freeFlowPacks } from "../data/packs";
import {
  applyHint,
  coverage,
  createLevel,
  dragTo,
  emptyPaths,
  isPairConnected,
  isSolved,
  startPath,
  type Paths,
} from "../logic/freeFlow";
import { FreeFlowBoard } from "./FreeFlowBoard";

const PALETTE = [
  colors.red,
  colors.green,
  colors.pink,
  colors.blue,
  colors.yellow,
  colors.purple,
  colors.orange,
  colors.teal,
];

export function FreeFlowGame() {
  const help = useHowToPlay("freeFlow");
  const { width, height, padding, s } = useResponsive();
  const maxBoard = Math.floor(
    Math.min(width - padding * 2, height * 0.5, s(380)),
  );
  const responsiveStyles = StyleSheet.create({
    row: { gap: s(spacing.sm), marginTop: s(spacing.lg) },
    boardWrap: {
      marginTop: s(spacing.lg),
      padding: s(spacing.sm),
      borderWidth: s(2),
      borderRadius: s(radius.lg),
    },
    tip: { marginTop: s(spacing.lg) },
    footer: { paddingBottom: s(spacing.xl) },
    skip: {
      marginTop: s(spacing.md),
      alignSelf: "center",
      paddingVertical: s(spacing.xs),
      paddingHorizontal: s(spacing.md),
    },
  });

  const [levelNo, setLevelNo] = useState<number | null>(null);
  const [level, setLevel] = useState(() => createLevel(1));
  const boardCellSize = Math.floor(maxBoard / level.size);
  const boardPx = boardCellSize * level.size;
  const [paths, setPaths] = useState<Paths>(() => emptyPaths(level));
  const [history, setHistory] = useState<Paths[]>([]);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const resultRecorded = useRef(false);
  const stars = starsForMoves(
    moves,
    level.pairs.length * 2,
    level.pairs.length * 4,
  );

  const pathsRef = useRef(paths);
  const activeRef = useRef<number | null>(null);
  const snapshotRef = useRef<Paths>(paths);

  const commit = (next: Paths) => {
    pathsRef.current = next;
    setPaths(next);
  };

  useEffect(() => {
    if (levelNo === null || !solved) {
      setShowResult(false);
      return;
    }
    haptic.success();
    const id = setTimeout(() => {
      if (!resultRecorded.current) {
        resultRecorded.current = true;
        useProgress.getState().recordLevel("freeFlow", levelNo, stars);
        playSound("win");
      }
      setShowResult(true);
    }, 600);
    return () => clearTimeout(id);
  }, [levelNo, solved, stars]);

  const loadLevel = (n: number) => {
    const next = createLevel(n);
    resultRecorded.current = false;
    setLevelNo(n);
    setLevel(next);
    commit(emptyPaths(next));
    setHistory([]);
    setMoves(0);
    setSolved(false);
    setShowResult(false);
    activeRef.current = null;
  };

  const skipLevel = () => {
    if (levelNo === null) return;
    useProgress.getState().skipLevel("freeFlow", levelNo);
    if (levelNo + 1 <= FREE_FLOW_LEVELS) {
      loadLevel(levelNo + 1);
      return;
    }
    setLevelNo(null);
  };

  const onStart = (cell: number) => {
    if (solved) return;
    const res = startPath(level, pathsRef.current, cell);
    if (!res) return;
    activeRef.current = res.color;
    snapshotRef.current = pathsRef.current;
    commit(res.paths);
    haptic.select();
  };

  const onMove = (cell: number) => {
    const color = activeRef.current;
    if (color === null || solved) return;
    const before = pathsRef.current;
    const next = dragTo(level, before, color, cell);
    if (next === before) return;
    commit(next);
    if (
      !isPairConnected(level, before, color) &&
      isPairConnected(level, next, color)
    ) {
      haptic.medium();
      playSound("pop");
    }
    if (isSolved(level, next)) setSolved(true);
  };

  const onEnd = () => {
    if (activeRef.current === null) return;
    activeRef.current = null;
    if (pathsRef.current !== snapshotRef.current) {
      setHistory((h) => [...h, snapshotRef.current]);
      setMoves((m) => m + 1);
    }
  };

  const undo = () => {
    if (history.length === 0 || solved) return;
    commit(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setMoves((m) => Math.max(m - 1, 0));
  };

  const hint = () => {
    if (solved) return;
    const next = applyHint(level, pathsRef.current);
    if (next === pathsRef.current) return;
    setHistory((h) => [...h, pathsRef.current]);
    commit(next);
    if (isSolved(level, next)) setSolved(true);
  };

  const connected = level.pairs.filter((_, i) =>
    isPairConnected(level, paths, i),
  ).length;
  const covered = Math.round(coverage(level, paths) * 100);
  const allConnected = connected === level.pairs.length;

  return (
    <>
      <GameScreen
        title="🌊 Free Flow"
        subtitle={
          levelNo === null
            ? "Choose a level"
            : `Level ${levelNo} · ${level.size}×${level.size}`
        }
        onBack={levelNo === null ? undefined : () => setLevelNo(null)}
        onHelp={help.open}
        scrollable={levelNo !== null}
      >
        {levelNo === null ? (
          <LevelSelect
            gameId="freeFlow"
            packs={freeFlowPacks}
            onSelect={loadLevel}
          />
        ) : (
          <>
            <View style={[styles.row, responsiveStyles.row]}>
              <StatChip label="MOVES" value={moves} color={colors.yellow} />
              <StatChip
                label="PAIRS"
                value={`${connected}/${level.pairs.length}`}
                color={colors.pink}
              />
              <StatChip
                label="COVERED"
                value={`${covered}%`}
                color={colors.teal}
              />
            </View>

            <View style={[styles.boardWrap, responsiveStyles.boardWrap]}>
              <FreeFlowBoard
                level={level}
                paths={paths}
                boardPx={boardPx}
                palette={PALETTE}
                onStart={onStart}
                onMove={onMove}
                onEnd={onEnd}
              />
            </View>

            <Text style={[styles.tip, responsiveStyles.tip]}>
              {allConnected && !solved
                ? "Almost! Cover every square 🌟"
                : "Connect matching colors and fill the whole board"}
            </Text>

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
                    label="💡 Hint"
                    colors={gradients.gold}
                    onPress={hint}
                  />
                </View>
                <View style={styles.flex}>
                  <GradientButton
                    label="🔄 Reset"
                    onPress={() => loadLevel(levelNo)}
                  />
                </View>
              </View>

              <PressableScale
                style={[styles.skipButton, responsiveStyles.skip]}
                onPress={skipLevel}
              >
                <Text style={styles.skipText}>⏭ Skip</Text>
              </PressableScale>
            </View>

            {showResult && (
              <ResultModal
                kind="win"
                title="Level complete! 🎉"
                subtitle={`${moves} moves`}
                playAgainLabel={
                  levelNo !== null && levelNo < FREE_FLOW_LEVELS
                    ? "Next level"
                    : "Levels"
                }
                onPlayAgain={() => {
                  if (levelNo !== null && levelNo < FREE_FLOW_LEVELS) {
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
        id="freeFlow"
        visible={help.visible}
        onClose={help.close}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  flex: { flex: 1 },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  arrowText: { color: colors.text },
  levelText: {
    ...typography.heading,
    color: colors.text,
    textAlign: "center",
  },
  skipButton: {
    alignSelf: "center",
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  boardWrap: {
    alignSelf: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  },
  tip: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  footer: { flex: 1, justifyContent: "flex-end" },
});
