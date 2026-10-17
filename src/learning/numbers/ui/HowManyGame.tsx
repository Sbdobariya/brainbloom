import { haptic, playSound, speak } from "@/core/audio/feedback";
import {
  ChoiceTile,
  GameScreen,
  ResultModal,
  StatChip,
} from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { starsFromRatio } from "@/core/logic/stars";
import { useProgress } from "@/core/store/progress";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { numbers } from "../data/numbers";
import { makeCountRounds } from "../logic/howMany";
import { EmojiPop } from "./EmojiPop";

const ROUNDS = 10;
const OPTIONS = 3;
const CHOICE_COLORS = [colors.pink, colors.teal, colors.orange];
const CAPITAL = (w: string) => w[0].toUpperCase() + w.slice(1);

export function HowManyGame() {
  const { s } = useResponsive();
  const [rounds, setRounds] = useState(() => makeCountRounds(ROUNDS, OPTIONS));
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = rounds[index];
  const { item, n } = round;
  const stars = starsFromRatio(firstTry / ROUNDS);
  const itemWidth = Math.max(56, s(68));

  const ask = () => speak(`How many ${item.plural} are there?`);

  // Ask the question when each round starts
  useEffect(() => {
    // wait for the pictures to finish popping in before speaking
    const id = setTimeout(ask, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, rounds]);

  // After a correct answer, celebrate and move on
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
    }, 2000);
    return () => clearTimeout(id);
  }, [solved, index]);

  // Save stars once at the end
  useEffect(() => {
    if (!finished) return;
    useProgress.getState().recordResult("howMany", stars);
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
      const w = CAPITAL(numbers[n - 1].word);
      speak(`${w}! ${w} ${n === 1 ? item.name : item.plural}`);
    } else if (!wrong.includes(i)) {
      setWrong((w) => [...w, i]);
      playSound("wrong");
      haptic.warning();
      speak("Try again");
    }
  };

  const restart = () => {
    setRounds(makeCountRounds(ROUNDS, OPTIONS));
    setIndex(0);
    setWrong([]);
    setSolved(false);
    setFirstTry(0);
    setFinished(false);
  };

  return (
    <GameScreen title="🧮 How Many?" subtitle="Count and tap">
      <View style={styles.row}>
        <StatChip
          label="ROUND"
          value={`${index + 1}/${ROUNDS}`}
          color={colors.teal}
        />
        <StatChip label="FIRST TRY" value={firstTry} color={colors.yellow} />
      </View>

      <View style={styles.card}>
        {/* key remounts the group so the pop-in replays every round */}
        <View key={index} style={[styles.items, { width: itemWidth * 5 }]}>
          {Array.from({ length: n }, (_, i) => (
            <EmojiPop key={i} emoji={item.emoji} index={i} />
          ))}
        </View>
        <Text style={styles.question}>
          {solved ? "Great job! 🎉" : `How many ${item.plural}?`}
        </Text>
        <PressableScale style={styles.speaker} haptic={false} onPress={ask}>
          <Text style={styles.speakerText}>🔊</Text>
        </PressableScale>
      </View>

      <View style={styles.choices}>
        {round.options.map((value, i) => (
          <ChoiceTile
            key={`${index}-${i}`}
            label={String(value)}
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
          title="Super counting! 🎉"
          subtitle={`${firstTry}/${ROUNDS} on the first try`}
          onPlayAgain={restart}
          onExit={() => router.back()}
        />
      )}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  card: {
    marginTop: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    minHeight: 270,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  items: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    minHeight: 136,
    alignContent: "center",
  },
  question: { ...typography.heading, color: colors.teal, textAlign: "center" },
  speaker: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.purple,
    borderRadius: radius.pill,
  },
  speakerText: { fontSize: 26 },
  choices: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xl },
});
