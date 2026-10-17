import { haptic, playSound } from "@/core/audio/feedback";
import {
  GameScreen,
  GradientButton,
  ResultModal,
  StatChip,
} from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { starsForMoves } from "@/core/logic/stars";
import { useProgress } from "@/core/store/progress";
import { colors, gradients, radius, spacing, typography } from "@/core/theme";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
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
  const { width, height } = useWindowDimensions();
  const boardPx = Math.min(width - spacing.lg * 2, height * 0.5, 380);

  const [levelNo, setLevelNo] = useState(1);
  const [level, setLevel] = useState(() => createLevel(1));
  const [paths, setPaths] = useState<Paths>(() => emptyPaths(level));
  const [history, setHistory] = useState<Paths[]>([]);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const resultRecorded = useRef(false);
  const recordResult = useProgress((state) => state.recordResult);
  const stars = starsForMoves(
    moves,
    level.pairs.length * 2,
    level.pairs.length * 4,
  );

  // Refs hold the newest values while a finger is down (state updates are async)
  const pathsRef = useRef(paths);
  const activeRef = useRef<number | null>(null);
  const snapshotRef = useRef<Paths>(paths);

  const commit = (next: Paths) => {
    pathsRef.current = next;
    setPaths(next);
  };

  useEffect(() => {
    if (!solved) {
      setShowResult(false);
      return;
    }
    haptic.success();
    const id = setTimeout(() => {
      if (!resultRecorded.current) {
        resultRecorded.current = true;
        recordResult("freeFlow", stars);
        playSound("win");
      }
      setShowResult(true);
    }, 600);
    return () => clearTimeout(id);
  }, [solved, recordResult, stars]);

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
    <GameScreen
      title="🌊 Free Flow"
      subtitle={`Level ${levelNo} · ${level.size}×${level.size}`}
    >
      <View style={styles.row}>
        <StatChip label="MOVES" value={moves} color={colors.yellow} />
        <StatChip
          label="PAIRS"
          value={`${connected}/${level.pairs.length}`}
          color={colors.pink}
        />
        <StatChip label="COVERED" value={`${covered}%`} color={colors.teal} />
      </View>

      <View style={styles.levelRow}>
        <PressableScale
          style={styles.arrow}
          disabled={levelNo <= 1}
          onPress={() => loadLevel(levelNo - 1)}
        >
          <Text style={styles.arrowText}>◀</Text>
        </PressableScale>
        <Text style={styles.levelText}>Level {levelNo}</Text>
        <PressableScale
          style={styles.arrow}
          onPress={() => loadLevel(levelNo + 1)}
        >
          <Text style={styles.arrowText}>▶</Text>
        </PressableScale>
      </View>

      <View style={styles.boardWrap}>
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

      <Text style={styles.tip}>
        {allConnected && !solved
          ? "Almost! Cover every square 🌟"
          : "Connect matching colors and fill the whole board"}
      </Text>

      <View style={styles.footer}>
        <View style={styles.row}>
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
      </View>

      {showResult && (
        <ResultModal
          kind="win"
          title="Level complete! 🎉"
          subtitle={`${moves} moves`}
          playAgainLabel="Next level"
          onPlayAgain={() => loadLevel(levelNo + 1)}
          onExit={() => router.back()}
          stars={stars}
        />
      )}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  flex: { flex: 1 },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  arrow: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: radius.pill,
  },
  arrowText: { color: colors.text, fontSize: 16 },
  levelText: {
    ...typography.heading,
    color: colors.text,
    minWidth: 100,
    textAlign: "center",
  },
  boardWrap: {
    alignSelf: "center",
    marginTop: spacing.lg,
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderRadius: radius.lg,
  },
  tip: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  footer: { flex: 1, justifyContent: "flex-end", paddingBottom: spacing.xl },
});
