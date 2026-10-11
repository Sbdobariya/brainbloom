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
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import {
  canMove,
  getHint,
  isSolved,
  moveTile,
  shuffleBoard,
} from "../logic/slidingPuzzle";
import { PuzzleTile } from "./PuzzleTile";

const EMOJIS = [
  "🧩",
  "🎮",
  "⭐",
  "🤖",
  "🦊",
  "🐸",
  "🐼",
  "🦁",
  "🐙",
  "🦄",
  "🐯",
  "🐵",
  "🐧",
  "🐢",
  "🐳",
];
const TILE_GRADIENTS = [
  gradients.primary,
  gradients.warm,
  gradients.cool,
  gradients.gold,
] as const;
const GAP = 8;
const PAD = 10;
const SIZES = [3, 4] as const;

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function SlidingPuzzleGame() {
  const { width, height } = useWindowDimensions();
  const boardPx = Math.min(width - spacing.lg * 2, height * 0.45, 380);
  const inner = boardPx - PAD * 2;

  const [size, setSize] = useState<3 | 4>(3);
  const [board, setBoard] = useState(() => shuffleBoard(3));
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hintTile, setHintTile] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const lastMoved = useRef<number | null>(null);
  const resultRecorded = useRef(false);
  const recordResult = useProgress((state) => state.recordResult);

  const tileSize = (inner - GAP * (size - 1)) / size;
  const stars = starsForMoves(
    moves,
    size === 3 ? 40 : 100,
    size === 3 ? 80 : 200,
  );

  // Timer runs until the puzzle is solved
  useEffect(() => {
    if (solved) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [solved]);

  // Let the last tile slide into place, then celebrate
  useEffect(() => {
    if (!solved) {
      setShowResult(false);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const id = setTimeout(() => {
      if (!resultRecorded.current) {
        resultRecorded.current = true;
        recordResult("slidingPuzzle", stars);
      }
      setShowResult(true);
    }, 700);
    return () => clearTimeout(id);
  }, [solved, recordResult, stars]);

  const startNew = (nextSize: 3 | 4 = size) => {
    resultRecorded.current = false;
    setSize(nextSize);
    setBoard(shuffleBoard(nextSize));
    setMoves(0);
    setSeconds(0);
    setHintTile(null);
    setSolved(false);
    setShowResult(false);
    lastMoved.current = null;
  };

  const onTilePress = (index: number) => {
    if (solved || !canMove(board, size, index)) return;
    const next = moveTile(board, size, index);
    lastMoved.current = board[index];
    setBoard(next);
    setMoves((m) => m + 1);
    setHintTile(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSolved(next)) setSolved(true);
  };

  const onHint = () => {
    if (solved) return;
    const index = getHint(board, size, lastMoved.current);
    setHintTile(board[index]);
    setTimeout(() => setHintTile(null), 1800);
  };

  return (
    <GameScreen title="Puzzle World" subtitle="Sliding Tile Puzzle">
      <View style={styles.row}>
        <StatChip label="MOVES" value={moves} color={colors.teal} />
        <StatChip
          label="TIME"
          value={formatTime(seconds)}
          color={colors.yellow}
        />
        <StatChip label="SIZE" value={`${size}×${size}`} color={colors.pink} />
      </View>

      <View style={styles.row}>
        {SIZES.map((s) => (
          <PressableScale
            key={s}
            onPress={() => startNew(s)}
            style={[styles.chip, size === s && styles.chipActive]}
          >
            <Text style={styles.chipText}>
              {s === 3 ? "😊" : "⚡"} {s}×{s}
            </Text>
          </PressableScale>
        ))}
      </View>

      <View style={[styles.board, { width: boardPx, height: boardPx }]}>
        <View
          style={{
            position: "absolute",
            left: PAD,
            top: PAD,
            width: inner,
            height: inner,
          }}
        >
          {board.map((value, index) =>
            value === 0 ? null : (
              <PuzzleTile
                key={value} // stable key: the tile keeps its identity and animates to new slots
                value={value}
                index={index}
                size={size}
                tileSize={tileSize}
                gap={GAP}
                emoji={EMOJIS[value - 1]}
                gradient={TILE_GRADIENTS[value % TILE_GRADIENTS.length]}
                hinted={hintTile === value}
                onPress={() => onTilePress(index)}
              />
            ),
          )}
        </View>
      </View>

      <Text style={styles.goal}>Put the tiles in order: 1, 2, 3 …</Text>

      <View style={styles.footer}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <GradientButton
              label="💡 Hint"
              colors={gradients.gold}
              onPress={onHint}
            />
          </View>
          <View style={styles.flex}>
            <GradientButton label="🔀 New" onPress={() => startNew()} />
          </View>
        </View>
      </View>

      {showResult && (
        <ResultModal
          kind="win"
          title="Puzzle solved! 🎉"
          subtitle={`${moves} moves · ${formatTime(seconds)}`}
          onPlayAgain={() => startNew()}
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
  chip: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  chipActive: { borderColor: colors.yellow },
  chipText: { ...typography.body, color: colors.text },
  board: {
    alignSelf: "center",
    marginTop: spacing.xl,
    backgroundColor: colors.bgSoft,
    borderRadius: radius.lg,
    borderColor: colors.cardBorder,
    borderWidth: 2,
  },
  goal: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  footer: { flex: 1, justifyContent: "flex-end", paddingBottom: spacing.xl },
});
