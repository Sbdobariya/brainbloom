import { haptic, playSound } from "@/core/audio/feedback";
import {
  GameScreen,
  GradientButton,
  HowToPlayOverlay,
  ResultModal,
  StatChip,
} from "@/core/components";
import { useHowToPlay } from "@/core/howToPlay/useHowToPlay";
import { starsForMoves } from "@/core/logic/stars";
import { useProgress } from "@/core/store/progress";
import { colors, gradients, spacing } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
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
  });
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
    haptic.success();
    const id = setTimeout(() => {
      if (!resultRecorded.current) {
        resultRecorded.current = true;
        recordResult("waterSort", stars);
        playSound("win");
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
        haptic.select();
        playSound("tap");
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
      haptic.tap();
      playSound("pop");
      if (isSolved(next)) setSolved(true);
      return;
    }

    // Can't pour there: switch the selection if possible
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
        subtitle={`Level ${level} · Sort ${colorCount} colors!`}
        onHelp={help.open}
      >
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
});
