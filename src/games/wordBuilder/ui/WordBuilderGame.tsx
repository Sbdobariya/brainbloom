import { haptic, playSound } from "@/core/audio/feedback";
import {
  GameScreen,
  GradientButton,
  ResultModal,
  StatChip,
} from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { TimerBar } from "@/core/components/TimerBar";
import { starsFromRatio } from "@/core/logic/stars";
import { useProgress } from "@/core/store/progress";
import { colors, gradients, radius, spacing, typography } from "@/core/theme";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { categoryInfo } from "../data/words";
import {
  calcPoints,
  isCorrect,
  pickRound,
  scrambleLetters,
  type Tile,
} from "../logic/wordBuilder";
import { AnswerSlots, type RoundStatus } from "./AnswerSlots";
import { LetterTile } from "./LetterTile";

const ROUNDS = 5;
const SECONDS_PER_ROUND = 30;

export function WordBuilderGame() {
  const [round, setRound] = useState(() => pickRound(ROUNDS));
  const [roundIndex, setRoundIndex] = useState(0);
  const [placed, setPlaced] = useState<Tile[]>([]);
  const [status, setStatus] = useState<RoundStatus>("playing");
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_ROUND);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [finished, setFinished] = useState(false);
  const resultRecorded = useRef(false);
  const recordResult = useProgress((state) => state.recordResult);

  const entry = round[roundIndex];
  const tiles = useMemo(() => scrambleLetters(entry.word), [entry, shuffleKey]);
  const info = categoryInfo[entry.category];
  const stars = starsFromRatio(correctCount / ROUNDS);

  useEffect(() => {
    if (!finished || resultRecorded.current) return;
    resultRecorded.current = true;
    recordResult("wordBuilder", stars);
    playSound(correctCount >= 3 ? "win" : "lose");
  }, [finished, recordResult, stars, correctCount]);

  // Countdown: one tick per second, only while playing
  useEffect(() => {
    if (status !== "playing" || finished) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [status, finished, roundIndex]);

  // Time ran out: gentle reveal, no penalty beyond the streak
  useEffect(() => {
    if (status === "playing" && secondsLeft <= 0 && !finished) {
      setStreak(0);
      setStatus("timeout");
    }
  }, [secondsLeft, status, finished]);

  const nextRound = () => {
    if (roundIndex + 1 >= ROUNDS) {
      setFinished(true);
      return;
    }
    setRoundIndex((i) => i + 1);
    setPlaced([]);
    setSecondsLeft(SECONDS_PER_ROUND);
    setStatus("playing");
  };

  // After feedback: wrong = try again, correct/timeout = next word
  useEffect(() => {
    if (status === "playing" || finished) return;
    const delay = status === "wrong" ? 700 : status === "correct" ? 1000 : 1800;
    const id = setTimeout(() => {
      if (status === "wrong") {
        setPlaced([]);
        setStatus("playing");
      } else {
        nextRound();
      }
    }, delay);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onTilePress = (tile: Tile) => {
    if (status !== "playing" || placed.length >= entry.word.length) return;
    setPlaced((p) => [...p, tile]);
    playSound("pop");
  };

  const onRemove = (slotIndex: number) => {
    if (status !== "playing") return;
    setPlaced((p) => p.filter((_, i) => i !== slotIndex));
  };

  const onCheck = () => {
    if (status !== "playing" || placed.length !== entry.word.length) return;
    if (isCorrect(entry, placed)) {
      setScore((s) => s + calcPoints(entry.word.length, secondsLeft, streak));
      setStreak((s) => s + 1);
      setCorrectCount((c) => c + 1);
      setStatus("correct");
      haptic.success();
      playSound("correct");
    } else {
      setStatus("wrong");
      haptic.warning();
      playSound("wrong");
    }
  };

  const restart = () => {
    resultRecorded.current = false;
    setRound(pickRound(ROUNDS));
    setRoundIndex(0);
    setPlaced([]);
    setStatus("playing");
    setSecondsLeft(SECONDS_PER_ROUND);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setFinished(false);
  };

  // What each slot shows: the answer on timeout, otherwise the player's letters
  const slotLetters: (string | null)[] = entry.word
    .split("")
    .map((l, i) => (status === "timeout" ? l : (placed[i]?.letter ?? null)));

  const message =
    status === "correct"
      ? "Great job! 🎉"
      : status === "wrong"
        ? "Almost! Try again"
        : status === "timeout"
          ? "Here is the word!"
          : `Build the word (${entry.word.length} letters)`;

  return (
    <GameScreen
      title="Word Builder"
      subtitle="Spelling Challenge"
      right={
        <PressableScale
          style={styles.shuffle}
          onPress={() => {
            setPlaced([]);
            setShuffleKey((k) => k + 1);
          }}
        >
          <Text style={styles.shuffleText}>🔀</Text>
        </PressableScale>
      }
    >
      <View style={styles.row}>
        <StatChip label="SCORE" value={score} color={colors.yellow} />
        <StatChip
          label="ROUND"
          value={`${roundIndex + 1}/${ROUNDS}`}
          color={colors.teal}
        />
        <StatChip label="STREAK" value={streak} color={colors.pink} />
      </View>

      <View style={styles.timer}>
        {/* key remounts the bar each round so it snaps back to full */}
        <TimerBar key={roundIndex} progress={secondsLeft / SECONDS_PER_ROUND} />
        <Text style={styles.seconds}>{Math.max(secondsLeft, 0)}s</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.category}>
          {info.emoji} {info.title.toUpperCase()}
        </Text>
        <Text style={styles.emoji}>{entry.emoji}</Text>
        <Text style={styles.message}>{message}</Text>
        <AnswerSlots
          letters={slotLetters}
          status={status}
          onRemove={onRemove}
        />
      </View>

      <View style={styles.tray}>
        {tiles.map((t) => (
          <LetterTile
            key={t.id}
            letter={t.letter}
            used={placed.some((p) => p.id === t.id)}
            onPress={() => onTilePress(t)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <GradientButton
          label="Check"
          colors={gradients.cool}
          disabled={placed.length !== entry.word.length || status !== "playing"}
          onPress={onCheck}
        />
      </View>

      {finished && (
        <ResultModal
          kind={correctCount >= 3 ? "win" : "lose"}
          title={correctCount >= 3 ? "Well done! 🎉" : "Nice try!"}
          subtitle={`${correctCount}/${ROUNDS} words · Score ${score}`}
          onPlayAgain={restart}
          onExit={() => router.back()}
          stars={stars}
        />
      )}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  timer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  seconds: {
    ...typography.caption,
    color: colors.textMuted,
    width: 36,
    textAlign: "right",
  },
  card: {
    marginTop: spacing.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  category: { ...typography.caption, color: colors.purple, letterSpacing: 1 },
  emoji: { fontSize: 64 },
  message: { ...typography.body, color: colors.teal },
  tray: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  footer: { flex: 1, justifyContent: "flex-end", paddingBottom: spacing.xl },
  shuffle: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: radius.pill,
  },
  shuffleText: { fontSize: 22 },
});
