import { haptic, playSound } from "@/core/audio/feedback";
import { GameScreen, ResultModal, StatChip, TimerBar } from "@/core/components";
import { starsFromRatio } from "@/core/logic/stars";
import { useProgress } from "@/core/store/progress";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { categoryInfo } from "../data/questions";
import { calcQuizPoints, hideTwoWrong, pickQuestions } from "../logic/quiz";
import { LifelineButton } from "./LifelineButton";
import { OptionButton, type OptionState } from "./OptionButton";

const QUESTIONS = 10;
const SECONDS = 15;
const LEVEL = 1 as const;
const LETTERS = ["A", "B", "C", "D"];

type Status = "playing" | "correct" | "wrong" | "timeout";

export function QuizGame() {
  const { width, contentWidth, padding, s } = useResponsive();
  const optionsGap = s(spacing.md);
  const availableWidth = Math.min(width, contentWidth) - padding * 2;
  const optionWidth = Math.floor((availableWidth - optionsGap) / 2);
  const responsiveStyles = StyleSheet.create({
    row: { gap: s(spacing.sm), marginTop: s(spacing.lg) },
    timer: { gap: s(spacing.md), marginTop: s(spacing.lg) },
    seconds: { width: s(36), fontSize: s(typography.caption.fontSize) },
    card: {
      marginTop: s(spacing.lg),
      padding: s(spacing.xl),
      minHeight: s(170),
      gap: s(spacing.md),
      borderWidth: s(1),
      borderRadius: s(radius.lg),
    },
    prompt: { fontSize: s(typography.title.fontSize) },
    message: {
      fontSize: s(typography.body.fontSize),
      minHeight: s(22),
    },
    tag: {
      paddingHorizontal: s(spacing.md),
      paddingVertical: s(spacing.xs),
      borderRadius: s(radius.pill),
    },
    tagText: { fontSize: s(typography.caption.fontSize) },
    options: { gap: optionsGap, marginTop: s(spacing.lg) },
    optionRow: { flexDirection: "row", gap: optionsGap },
    lifelines: { gap: s(spacing.sm), paddingBottom: s(spacing.xl) },
  });
  const [questions, setQuestions] = useState(() =>
    pickQuestions(QUESTIONS, LEVEL),
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hidden, setHidden] = useState<number[]>([]);
  const [status, setStatus] = useState<Status>("playing");
  const [secondsLeft, setSecondsLeft] = useState(SECONDS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lifelines, setLifelines] = useState({ fifty: 1, skip: 2, time: 2 });
  const [finished, setFinished] = useState(false);
  const resultRecorded = useRef(false);
  const recordResult = useProgress((state) => state.recordResult);

  const q = questions[index];
  const info = categoryInfo[q.category];
  const stars = starsFromRatio(correctCount / QUESTIONS);

  useEffect(() => {
    if (!finished || resultRecorded.current) return;
    resultRecorded.current = true;
    recordResult("quiz", stars);
    playSound(correctCount >= 6 ? "win" : "lose");
  }, [finished, recordResult, stars, correctCount]);

  // Countdown, only while a question is open
  useEffect(() => {
    if (status !== "playing" || finished) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [status, finished, index]);

  // Time is up: show the answer, reset the streak
  useEffect(() => {
    if (status === "playing" && secondsLeft <= 0 && !finished) {
      setStreak(0);
      setStatus("timeout");
    }
  }, [secondsLeft, status, finished]);

  const nextQuestion = () => {
    if (index + 1 >= QUESTIONS) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setHidden([]);
    setSecondsLeft(SECONDS);
    setStatus("playing");
  };

  // After feedback, move on automatically
  useEffect(() => {
    if (status === "playing" || finished) return;
    const id = setTimeout(nextQuestion, status === "correct" ? 900 : 1600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onAnswer = (i: number) => {
    if (status !== "playing") return;
    setSelected(i);
    if (i === q.answerIndex) {
      setScore((s) => s + calcQuizPoints(secondsLeft, streak));
      setStreak((s) => s + 1);
      setCorrectCount((c) => c + 1);
      setStatus("correct");
      haptic.success();
      playSound("correct");
    } else {
      setStreak(0);
      setStatus("wrong");
      haptic.warning();
      playSound("wrong");
    }
  };

  const useFifty = () => {
    if (status !== "playing" || hidden.length > 0) return;
    setHidden(hideTwoWrong(q));
    setLifelines((l) => ({ ...l, fifty: l.fifty - 1 }));
    playSound("tap");
  };

  const useSkip = () => {
    if (status !== "playing") return;
    setLifelines((l) => ({ ...l, skip: l.skip - 1 }));
    playSound("tap");
    nextQuestion();
  };

  const useTime = () => {
    if (status !== "playing") return;
    setSecondsLeft((s) => s + 5);
    setLifelines((l) => ({ ...l, time: l.time - 1 }));
    playSound("tap");
  };

  const restart = () => {
    resultRecorded.current = false;
    setQuestions(pickQuestions(QUESTIONS, LEVEL));
    setIndex(0);
    setSelected(null);
    setHidden([]);
    setStatus("playing");
    setSecondsLeft(SECONDS);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setLifelines({ fifty: 1, skip: 2, time: 2 });
    setFinished(false);
  };

  const optionState = (i: number): OptionState => {
    if (status === "playing") return hidden.includes(i) ? "hidden" : "idle";
    if (i === q.answerIndex) return "correct";
    if (i === selected) return "wrong";
    return "dimmed";
  };

  const message =
    status === "correct"
      ? "Great job! 🎉"
      : status === "wrong"
        ? "Almost! The answer is shown"
        : status === "timeout"
          ? "Time's up! Here is the answer"
          : "";

  return (
    <GameScreen title="🧠 Brain Boost" subtitle="Speed Quiz">
      <View style={[styles.row, responsiveStyles.row]}>
        <StatChip label="SCORE" value={score} color={colors.yellow} />
        <StatChip label="STREAK" value={`${streak}x`} color={colors.pink} />
        <StatChip
          label="CORRECT"
          value={`${correctCount}/${QUESTIONS}`}
          color={colors.teal}
        />
        <StatChip
          label="QUESTION"
          value={`${index + 1}/${QUESTIONS}`}
          color={colors.purple}
        />
      </View>

      <View style={[styles.timer, responsiveStyles.timer]}>
        <TimerBar key={index} progress={Math.min(secondsLeft / SECONDS, 1)} />
        <Text style={[styles.seconds, responsiveStyles.seconds]}>
          {Math.max(secondsLeft, 0)}s
        </Text>
      </View>

      <View style={[styles.card, responsiveStyles.card]}>
        <View style={[styles.tag, responsiveStyles.tag]}>
          <Text
            style={[styles.tagText, responsiveStyles.tagText]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {info.emoji} {info.title.toUpperCase()}
          </Text>
        </View>
        <Text
          style={[styles.prompt, responsiveStyles.prompt]}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {q.prompt}
        </Text>
        <Text style={[styles.message, responsiveStyles.message]}>
          {message}
        </Text>
      </View>

      <View style={[styles.options, responsiveStyles.options]}>
        {Array.from({ length: Math.ceil(q.options.length / 2) }, (_, row) => (
          <View key={row} style={responsiveStyles.optionRow}>
            {q.options.slice(row * 2, row * 2 + 2).map((o, col) => {
              const i = row * 2 + col;
              return (
                <OptionButton
                  key={`${q.id}-${i}`}
                  width={optionWidth}
                  letter={LETTERS[i]}
                  label={o}
                  state={optionState(i)}
                  onPress={() => onAnswer(i)}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View style={[styles.lifelines, responsiveStyles.lifelines]}>
        <LifelineButton
          emoji="🎲"
          label="50/50"
          count={lifelines.fifty}
          onPress={useFifty}
        />
        <LifelineButton
          emoji="⏭️"
          label="Skip"
          count={lifelines.skip}
          onPress={useSkip}
        />
        <LifelineButton
          emoji="⏱️"
          label="+5s"
          count={lifelines.time}
          onPress={useTime}
        />
      </View>

      {finished && (
        <ResultModal
          kind={correctCount >= 6 ? "win" : "lose"}
          title={correctCount >= 6 ? "Brilliant! 🎉" : "Nice try!"}
          subtitle={`${correctCount}/${QUESTIONS} correct · Score ${score}`}
          onPlayAgain={restart}
          onExit={() => router.back()}
          stars={stars}
        />
      )}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  timer: {
    flexDirection: "row",
    alignItems: "center",
  },
  seconds: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "right",
  },
  card: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  },
  tag: {
    backgroundColor: colors.bgSoft,
  },
  tagText: { ...typography.caption, color: colors.yellow, letterSpacing: 1 },
  prompt: { ...typography.title, color: colors.text, textAlign: "center" },
  message: { ...typography.body, color: colors.teal },
  options: {
    flexDirection: "column",
  },
  lifelines: {
    flexDirection: "row",
    marginTop: "auto",
  },
});
