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
import { useResponsive } from "@/core/theme/responsive";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
const SIZES = [3, 4] as const;

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function SlidingPuzzleGame() {
  const { width, height, padding, s } = useResponsive();
  const gap = s(8);
  const pad = s(10);
  const boardPx = Math.floor(
    Math.min(width - padding * 2, height * 0.45, s(380)),
  );
  const inner = boardPx - pad * 2;
  const responsiveStyles = StyleSheet.create({
    row: { gap: s(spacing.sm), marginTop: s(spacing.lg) },
    chips: {
      minHeight: Math.max(56, s(48)),
      borderRadius: s(radius.pill),
      borderWidth: s(1),
    },
    chipText: { fontSize: s(typography.body.fontSize) },
    board: {
      marginTop: s(spacing.xl),
      borderRadius: s(radius.lg),
      borderWidth: s(2),
    },
    boardInner: {
      position: "absolute",
      left: pad,
      top: pad,
      width: inner,
      height: inner,
    },
    goal: { marginTop: s(spacing.lg) },
    footer: { paddingBottom: s(spacing.xl) },
  });

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

  const tileSize = Math.floor((inner - gap * (size - 1)) / size);
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
    haptic.success();
    const id = setTimeout(() => {
      if (!resultRecorded.current) {
        resultRecorded.current = true;
        recordResult("slidingPuzzle", stars);
        playSound("win");
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
    haptic.tap();
    playSound("pop");
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
      <View style={[styles.row, responsiveStyles.row]}>
        <StatChip label="MOVES" value={moves} color={colors.teal} />
        <StatChip
          label="TIME"
          value={formatTime(seconds)}
          color={colors.yellow}
        />
        <StatChip label="SIZE" value={`${size}×${size}`} color={colors.pink} />
      </View>

      <View style={[styles.row, responsiveStyles.row]}>
        {SIZES.map((s) => (
          <PressableScale
            key={s}
            onPress={() => startNew(s)}
            style={[
              styles.chip,
              responsiveStyles.chips,
              size === s && styles.chipActive,
            ]}
          >
            <Text style={[styles.chipText, responsiveStyles.chipText]}>
              {s === 3 ? "😊" : "⚡"} {s}×{s}
            </Text>
          </PressableScale>
        ))}
      </View>

      <View
        style={[
          styles.board,
          responsiveStyles.board,
          { width: boardPx, height: boardPx },
        ]}
      >
        <View style={responsiveStyles.boardInner}>
          {board.map((value, index) =>
            value === 0 ? null : (
              <PuzzleTile
                key={value} // stable key: the tile keeps its identity and animates to new slots
                value={value}
                index={index}
                size={size}
                tileSize={tileSize}
                gap={gap}
                emoji={EMOJIS[value - 1]}
                gradient={TILE_GRADIENTS[value % TILE_GRADIENTS.length]}
                hinted={hintTile === value}
                onPress={() => onTilePress(index)}
              />
            ),
          )}
        </View>
      </View>

      <Text style={[styles.goal, responsiveStyles.goal]}>
        Put the tiles in order: 1, 2, 3 …
      </Text>

      <View style={[styles.footer, responsiveStyles.footer]}>
        <View style={[styles.row, responsiveStyles.row]}>
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
  row: { flexDirection: "row" },
  flex: { flex: 1 },
  chip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  },
  chipActive: { borderColor: colors.yellow },
  chipText: { ...typography.body, color: colors.text },
  board: {
    alignSelf: "center",
    backgroundColor: colors.bgSoft,
    borderColor: colors.cardBorder,
  },
  goal: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  footer: { flex: 1, justifyContent: "flex-end" },
});
