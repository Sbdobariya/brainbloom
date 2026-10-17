import { haptic, playSound, speak } from "@/core/audio/feedback";
import {
  GameScreen,
  HowToPlayOverlay,
  ResultModal,
  StatChip,
} from "@/core/components";
import { ChoiceTile } from "@/core/components/ChoiceTile";
import { PressableScale } from "@/core/components/PressableScale";
import { useHowToPlay } from "@/core/howToPlay/useHowToPlay";
import { starsFromRatio } from "@/core/logic/stars";
import { useProgress } from "@/core/store/progress";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { makeRounds } from "../logic/findLetter";

const ROUNDS = 10;
const OPTIONS = 3;
const CHOICE_COLORS = [colors.pink, colors.teal, colors.orange];

export function FindLetterGame() {
  const help = useHowToPlay("findLetter");
  const { s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    row: { gap: s(spacing.sm), marginTop: s(spacing.lg) },
    card: {
      marginTop: s(spacing.xl),
      gap: s(spacing.sm),
      padding: s(spacing.xl),
      borderWidth: s(1),
      borderRadius: s(radius.lg),
    },
    emoji: { fontSize: s(100) },
    word: { fontSize: s(typography.title.fontSize) },
    question: {
      fontSize: s(typography.body.fontSize),
      minHeight: s(22),
    },
    speaker: {
      width: Math.max(56, s(56)),
      height: Math.max(56, s(56)),
      marginTop: s(spacing.sm),
      borderRadius: s(radius.pill),
    },
    speakerText: { fontSize: s(26) },
    choices: { gap: s(spacing.md), marginTop: s(spacing.xl) },
  });
  const [rounds, setRounds] = useState(() => makeRounds(ROUNDS, OPTIONS));
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = rounds[index];
  const { target } = round;
  const ratio = firstTry / ROUNDS;
  const stars = starsFromRatio(ratio);

  const ask = () => speak(`Which letter does ${target.word} start with?`);

  // Ask the question out loud at the start of every round
  useEffect(() => {
    if (help.visible) return;
    ask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, rounds, help.visible]);

  // After a correct answer, celebrate for a moment and move on
  useEffect(() => {
    if (!solved) return;
    const id = setTimeout(() => {
      if (index + 1 >= ROUNDS) {
        setFinished(true);
      } else {
        setIndex((i) => i + 1);
        setWrong([]);
        setSolved(false);
      }
    }, 1900);
    return () => clearTimeout(id);
  }, [solved, index]);

  // Save stars once when the game ends
  useEffect(() => {
    if (!finished) return;
    useProgress.getState().recordResult("findLetter", stars);
    playSound("win");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const onPick = (i: number) => {
    if (solved) return;
    if (i === round.answerIndex) {
      setSolved(true);
      if (wrong.length === 0) setFirstTry((c) => c + 1);
      playSound("correct");
      haptic.success();
      speak(`${target.letter}! ${target.letter} is for ${target.word}`);
    } else if (!wrong.includes(i)) {
      setWrong((w) => [...w, i]);
      playSound("wrong");
      haptic.warning();
      speak("Try again");
    }
  };

  const restart = () => {
    setRounds(makeRounds(ROUNDS, OPTIONS));
    setIndex(0);
    setWrong([]);
    setSolved(false);
    setFirstTry(0);
    setFinished(false);
  };

  return (
    <>
      <GameScreen
        title="🔎 Find the Letter"
        subtitle="Listen and tap"
        onHelp={help.open}
      >
        <View style={[styles.row, responsiveStyles.row]}>
          <StatChip
            label="ROUND"
            value={`${index + 1}/${ROUNDS}`}
            color={colors.teal}
          />
          <StatChip label="FIRST TRY" value={firstTry} color={colors.yellow} />
        </View>

        <View style={[styles.card, responsiveStyles.card]}>
          <Text style={[styles.emoji, responsiveStyles.emoji]}>
            {target.emoji}
          </Text>
          <Text style={[styles.word, responsiveStyles.word]}>
            {target.word}
          </Text>
          <Text style={[styles.question, responsiveStyles.question]}>
            {solved ? "Great job! 🎉" : "Which letter does it start with?"}
          </Text>
          <PressableScale
            style={[styles.speaker, responsiveStyles.speaker]}
            haptic={false}
            onPress={ask}
          >
            <Text style={[styles.speakerText, responsiveStyles.speakerText]}>
              🔊
            </Text>
          </PressableScale>
        </View>

        <View style={[styles.choices, responsiveStyles.choices]}>
          {round.options.map((letter, i) => (
            <ChoiceTile
              key={`${index}-${i}`}
              label={letter}
              color={CHOICE_COLORS[i % CHOICE_COLORS.length]}
              state={
                solved && i === round.answerIndex
                  ? "correct"
                  : wrong.includes(i)
                    ? "wrong"
                    : "idle"
              }
              onPress={() => onPick(i)}
            />
          ))}
        </View>

        {finished && (
          <ResultModal
            kind="win"
            stars={stars}
            title="Great learning! 🎉"
            subtitle={`${firstTry}/${ROUNDS} on the first try`}
            onPlayAgain={restart}
            onExit={() => router.back()}
          />
        )}
      </GameScreen>
      <HowToPlayOverlay
        id="findLetter"
        visible={help.visible}
        onClose={help.close}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  card: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  },
  emoji: {},
  word: { ...typography.title, color: colors.text },
  question: { ...typography.body, color: colors.teal },
  speaker: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.purple,
  },
  speakerText: {},
  choices: { flexDirection: "row" },
});
