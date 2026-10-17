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
import { makeShapeRounds } from "../logic/findShape";
import { ShapeView } from "./ShapeView";

const ROUNDS = 8;
const OPTIONS = 3;
const SHAPE_COLORS = [colors.pink, colors.teal, colors.orange];

export function FindShapeGame() {
  const help = useHowToPlay("findShape");
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
    shape: { width: Math.max(120, s(170)), height: Math.max(120, s(170)) },
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
  const [rounds, setRounds] = useState(() => makeShapeRounds(ROUNDS, OPTIONS));
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = rounds[index];
  const { target } = round;
  const ratio = firstTry / ROUNDS;
  const stars = starsFromRatio(ratio);

  const ask = () => speak("What shape is this?");

  useEffect(() => {
    if (help.visible) return;
    ask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, rounds, help.visible]);

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

  useEffect(() => {
    if (!finished) return;
    useProgress.getState().recordResult("findShape", stars);
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
      speak(`${target.name}! ${target.fact}`);
    } else if (!wrong.includes(i)) {
      setWrong((w) => [...w, i]);
      playSound("wrong");
      haptic.warning();
      speak("Try again");
    }
  };

  const restart = () => {
    setRounds(makeShapeRounds(ROUNDS, OPTIONS));
    setIndex(0);
    setWrong([]);
    setSolved(false);
    setFirstTry(0);
    setFinished(false);
  };

  return (
    <>
      <GameScreen
        title="🔶 Name the Shape"
        subtitle="Look and tap"
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
          <ShapeView
            id={target.id}
            size={responsiveStyles.shape.width}
            color={SHAPE_COLORS[index % SHAPE_COLORS.length]}
          />
          <Text style={[styles.question, responsiveStyles.question]}>
            {solved ? "Great job! 🎉" : "What shape is this?"}
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
          {round.options.map((name, i) => (
            <ChoiceTile
              key={`${index}-${i}`}
              label={name}
              fontSize={26}
              color={SHAPE_COLORS[i % SHAPE_COLORS.length]}
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
        id="findShape"
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
  question: { ...typography.body, color: colors.teal },
  speaker: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.purple,
  },
  speakerText: {},
  choices: { flexDirection: "row" },
});
