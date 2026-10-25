import { haptic, playSound } from "@/core/audio/feedback";
import {
  GameScreen,
  GradientButton,
  HowToPlayOverlay,
  ResultModal,
  StatChip,
} from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { useHowToPlay } from "@/core/howToPlay/useHowToPlay";
import { starsForTicTacToe, type Stars } from "@/core/logic/stars";
import { useProgress } from "@/core/store/progress";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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

export function TicTacToeGame() {
  const help = useHowToPlay("ticTacToe");
  const { width, padding, s } = useResponsive();
  const gap = s(10);
  const maxBoard = Math.min(width - padding * 2, s(380));
  const cellSize = Math.floor((maxBoard - gap * 2) / 3);
  const boardSize = cellSize * 3 + gap * 2;
  const responsiveStyles = StyleSheet.create({
    row: { gap: s(spacing.sm), marginTop: s(spacing.lg) },
    status: { marginTop: s(spacing.xl) },
    chip: { minHeight: Math.max(56, s(48)), borderRadius: s(radius.pill) },
    statusText: { fontSize: s(typography.heading.fontSize) },
    chipText: { fontSize: s(typography.body.fontSize) },
    board: { width: boardSize, gap, marginTop: s(spacing.xl) },
    boardRow: { flexDirection: "row", gap },
    footer: { paddingBottom: s(spacing.xl) },
  });

  const [board, setBoard] = useState(createBoard());
  const [turn, setTurn] = useState<Player>("X"); // human = X, CPU = O
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [scores, setScores] = useState({ you: 0, draws: 0, cpu: 0 });
  const [showResult, setShowResult] = useState(false);
  const resultRecorded = useRef(false);
  const recordResult = useProgress((state) => state.recordResult);

  const result = getWinner(board);
  const draw = !result && isDraw(board);
  const over = !!result || draw;
  const stars: Stars = starsForTicTacToe(
    result ? (result.winner === "X" ? "win" : "lose") : "draw",
    difficulty,
  );

  // CPU plays after a short "thinking" delay
  useEffect(() => {
    if (turn !== "O" || over) return;
    const id = setTimeout(() => {
      const move = getCpuMove(board, "O", difficulty);
      setBoard(applyMove(board, move, "O"));
      playSound("pop");
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
    const id = setTimeout(() => {
      if (!resultRecorded.current) {
        resultRecorded.current = true;
        recordResult("ticTacToe", stars);
        playSound(result?.winner === "O" ? "lose" : "win");
      }
      setShowResult(true);
    }, 900);
    return () => clearTimeout(id);
  }, [over, recordResult, result?.winner, stars]);

  // Update scores once when a round ends
  useEffect(() => {
    if (!over) return;
    if (result?.winner === "X") {
      setScores((s) => ({ ...s, you: s.you + 1 }));
      haptic.success();
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
    playSound("pop");
    setTurn("O");
  };

  const newRound = () => {
    resultRecorded.current = false;
    setBoard(createBoard());
    setTurn("X");
    setShowResult(false);
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
    <>
      <GameScreen
        title="Tic Tac Toe"
        subtitle={`vs Computer · ${difficulty}`}
        onHelp={help.open}
      >
        <View style={[styles.row, responsiveStyles.row]}>
          <StatChip label="YOU" value={scores.you} color={colors.pink} />
          <StatChip
            label="DRAWS"
            value={scores.draws}
            color={colors.textMuted}
          />
          <StatChip label="CPU" value={scores.cpu} color={colors.teal} />
        </View>

        <Text
          style={[styles.status, responsiveStyles.statusText]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {status}
        </Text>

        <View style={[styles.row, responsiveStyles.row]}>
          {(["easy", "hard"] as const).map((d) => (
            <PressableScale
              key={d}
              onPress={() => changeDifficulty(d)}
              style={[
                styles.chip,
                responsiveStyles.chip,
                difficulty === d && styles.chipActive,
              ]}
            >
              <Text
                style={[styles.chipText, responsiveStyles.chipText]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {d === "easy" ? "🙂 Easy" : "💀 Hard"}
              </Text>
            </PressableScale>
          ))}
        </View>

        <View style={[styles.board, responsiveStyles.board]}>
          {[0, 1, 2].map((r) => (
            <View key={r} style={responsiveStyles.boardRow}>
              {[0, 1, 2].map((c) => {
                const i = r * 3 + c;
                const mark = board[i];
                return (
                  <Cell
                    key={i}
                    mark={mark}
                    size={cellSize}
                    highlighted={winLine.includes(i)}
                    disabled={over || turn !== "X" || !!mark}
                    onPress={() => onCellPress(i)}
                  />
                );
              })}
            </View>
          ))}
        </View>

        <View style={[styles.footer, responsiveStyles.footer]}>
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
            stars={stars}
            ads
          />
        )}
      </GameScreen>
      <HowToPlayOverlay
        id="ticTacToe"
        visible={help.visible}
        onClose={help.close}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  status: {
    ...typography.heading,
    color: colors.text,
    textAlign: "center",
  },
  chip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  chipActive: { borderColor: colors.yellow },
  chipText: { ...typography.body, color: colors.text },
  board: {
    alignSelf: "center",
  },
  footer: { flex: 1, justifyContent: "flex-end" },
});
