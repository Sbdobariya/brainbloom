import {
  GameScreen,
  GradientButton,
  ResultModal,
  StatChip,
} from "@/core/components";
import { starsForMoves } from "@/core/logic/stars";
import { useProgress } from "@/core/store/progress";
import { colors, gradients, spacing } from "@/core/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
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

const TUBE_W = 56;
const TUBE_H = 190;

export function WaterSortGame() {
  const [level, setLevel] = useState(1);
  const [tubes, setTubes] = useState<Tube[]>(() => createLevel(1));
  const [history, setHistory] = useState<Tube[][]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const resultRecorded = useRef(false);
  const recordResult = useProgress((state) => state.recordResult);

  const { colors: colorCount } = getLevelConfig(level);
  const stars = starsForMoves(moves, colorCount * 5, colorCount * 8);

  // Let the last pour finish, then celebrate
  useEffect(() => {
    if (!solved) {
      setShowResult(false);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const id = setTimeout(() => {
      if (!resultRecorded.current) {
        resultRecorded.current = true;
        recordResult("waterSort", stars);
      }
      setShowResult(true);
    }, 800);
    return () => clearTimeout(id);
  }, [solved, recordResult, stars]);

  const loadLevel = (n: number) => {
    resultRecorded.current = false;
    setLevel(n);
    setTubes(createLevel(n));
    setHistory([]);
    setSelected(null);
    setMoves(0);
    setSolved(false);
    setShowResult(false);
  };

  const onTubePress = (i: number) => {
    if (solved) return;

    // Nothing picked yet: pick this tube if it has liquid
    if (selected === null) {
      if (tubes[i].length > 0) {
        setSelected(i);
        Haptics.selectionAsync();
      }
      return;
    }

    // Tapped the same tube: put it back
    if (selected === i) {
      setSelected(null);
      return;
    }

    // Try to pour
    if (canPour(tubes, selected, i)) {
      const next = pour(tubes, selected, i);
      setHistory((h) => [...h, tubes]);
      setTubes(next);
      setMoves((m) => m + 1);
      setSelected(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isSolved(next)) setSolved(true);
      return;
    }

    // Can't pour there: switch the selection if possible
    if (tubes[i].length > 0) {
      setSelected(i);
      Haptics.selectionAsync();
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

  return (
    <GameScreen
      title="Water Sort"
      subtitle={`Level ${level} · Sort ${colorCount} colors!`}
    >
      <View style={styles.row}>
        <StatChip label="MOVES" value={moves} color={colors.blue} />
        <StatChip
          label="SOLVED"
          value={`${solvedCount(tubes)}/${colorCount}`}
          color={colors.green}
        />
        <StatChip label="LEVEL" value={level} color={colors.yellow} />
      </View>

      <View style={styles.tubes}>
        {tubes.map((tube, i) => (
          <LiquidTube
            key={i}
            layers={tube.map((c) => PALETTE[c % PALETTE.length])}
            selected={selected === i}
            width={TUBE_W}
            height={TUBE_H}
            onPress={() => onTubePress(i)}
          />
        ))}
      </View>

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
            <GradientButton label="🔄 Reset" onPress={() => loadLevel(level)} />
          </View>
        </View>
      </View>

      {showResult && (
        <ResultModal
          kind="win"
          title="Level complete! 🎉"
          subtitle={`${moves} moves`}
          playAgainLabel="Next level"
          onPlayAgain={() => loadLevel(level + 1)}
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
  tubes: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: spacing.lg,
    rowGap: spacing.xl,
    marginTop: spacing.xxl,
    paddingTop: spacing.lg,
  },
  footer: { flex: 1, justifyContent: "flex-end", paddingBottom: spacing.xl },
});
