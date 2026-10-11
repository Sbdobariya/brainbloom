import {
  GameScreen,
  GradientButton,
  ResultModal,
  StatChip,
} from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius, spacing, typography } from "@/core/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import {
  applyMove,
  createBoard,
  getCpuMove,
  getWinner,
  isDraw,
  type Difficulty,
  type Player,
} from "../logic/ticTacToe";
import { Cell } from "./Cell";

const GAP = 10;

export function TicTacToeGame() {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - spacing.lg * 2, 380);
  const cellSize = (boardSize - GAP * 2) / 3;

  const [board, setBoard] = useState(createBoard());
  const [turn, setTurn] = useState<Player>("X"); // human = X, CPU = O
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [scores, setScores] = useState({ you: 0, draws: 0, cpu: 0 });
  const [showResult, setShowResult] = useState(false);

  const result = getWinner(board);
  const draw = !result && isDraw(board);
  const over = !!result || draw;

  // CPU plays after a short "thinking" delay
  useEffect(() => {
    if (turn !== "O" || over) return;
    const id = setTimeout(() => {
      const move = getCpuMove(board, "O", difficulty);
      setBoard(applyMove(board, move, "O"));
      setTurn("X");
    }, 500);
    return () => clearTimeout(id);
  }, [turn, over, board, difficulty]);

  // Show the result modal after a short pause, so the winning cells pulse first
  useEffect(() => {
    if (!over) {
      setShowResult(false);
      return;
    }
    const id = setTimeout(() => setShowResult(true), 900);
    return () => clearTimeout(id);
  }, [over]);

  // Update scores once when a round ends
  useEffect(() => {
    if (!over) return;
    if (result?.winner === "X") {
      setScores((s) => ({ ...s, you: s.you + 1 }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (result?.winner === "O") {
      setScores((s) => ({ ...s, cpu: s.cpu + 1 }));
    } else {
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over]);

  const onCellPress = (i: number) => {
    if (over || turn !== "X" || board[i]) return;
    setBoard(applyMove(board, i, "X"));
    setTurn("O");
  };

  const newRound = () => {
    setBoard(createBoard());
    setTurn("X");
  };

  const changeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    newRound();
  };

  const status = result
    ? result.winner === "X"
      ? "You win! 🎉"
      : "CPU wins!"
    : draw
      ? "It's a draw!"
      : turn === "X"
        ? "Your turn!"
        : "CPU is thinking...";

  const winLine: number[] = result?.line ?? [];

  return (
    <GameScreen title="Tic Tac Toe" subtitle={`vs Computer · ${difficulty}`}>
      <View style={styles.row}>
        <StatChip label="YOU" value={scores.you} color={colors.pink} />
        <StatChip label="DRAWS" value={scores.draws} color={colors.textMuted} />
        <StatChip label="CPU" value={scores.cpu} color={colors.teal} />
      </View>

      <Text style={styles.status}>{status}</Text>

      <View style={styles.row}>
        {(["easy", "hard"] as const).map((d) => (
          <PressableScale
            key={d}
            onPress={() => changeDifficulty(d)}
            style={[styles.chip, difficulty === d && styles.chipActive]}
          >
            <Text style={styles.chipText}>
              {d === "easy" ? "🙂 Easy" : "💀 Hard"}
            </Text>
          </PressableScale>
        ))}
      </View>

      <View style={[styles.board, { width: boardSize }]}>
        {board.map((mark, i) => (
          <Cell
            key={i}
            mark={mark}
            size={cellSize}
            highlighted={winLine.includes(i)}
            disabled={over || turn !== "X" || !!mark}
            onPress={() => onCellPress(i)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <GradientButton label="New Game" onPress={newRound} />
      </View>
      {showResult && (
        <ResultModal
          kind={result?.winner === "X" ? "win" : result ? "lose" : "draw"}
          title={
            result?.winner === "X"
              ? "You won! 🎉"
              : result
                ? "Nice try!"
                : "Good game!"
          }
          subtitle={
            result?.winner === "X"
              ? "Amazing job!"
              : result
                ? "Let's try again!"
                : "It's a draw."
          }
          onPlayAgain={newRound}
          onExit={() => router.back()}
        />
      )}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  status: {
    ...typography.heading,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.xl,
  },
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    alignSelf: "center",
    marginTop: spacing.xl,
  },
  footer: { flex: 1, justifyContent: "flex-end", paddingBottom: spacing.xl },
});
