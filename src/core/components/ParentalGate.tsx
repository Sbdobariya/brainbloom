import { haptic } from "@/core/audio/feedback";
import { createChallenge, isCorrect } from "@/core/logic/gate";
import { useGate } from "@/core/store/gate";
import { colors, radius, spacing, typography } from "@/core/theme";
import { useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { PressableScale } from "./PressableScale";

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function GateCard() {
  const close = useGate((s) => s.close);
  const onPass = useGate((s) => s.onPass);

  // New challenge every time the gate opens (this card only exists while visible)
  const challenge = useMemo(() => createChallenge(), []);
  const [entered, setEntered] = useState<number[]>([]);

  const appear = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    appear.value = withSpring(1, { damping: 14, stiffness: 160 });
  }, [appear]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [
      { scale: 0.85 + appear.value * 0.15 },
      { translateX: shake.value },
    ],
  }));

  const onDigit = (d: number) => {
    if (entered.length >= challenge.sequence.length) return;
    const next = [...entered, d];
    setEntered(next);
    haptic.select();

    if (next.length === challenge.sequence.length) {
      if (isCorrect(challenge, next)) {
        haptic.success();
        const cb = onPass;
        close();
        cb?.();
      } else {
        haptic.warning();
        shake.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withRepeat(withTiming(10, { duration: 90 }), 4, true),
          withTiming(0, { duration: 50 }),
        );
        setTimeout(() => setEntered([]), 450);
      }
    }
  };

  return (
    <View style={styles.backdrop}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.lock}>🔒</Text>
        <Text style={styles.title}>Grown-ups only</Text>
        <Text style={styles.hint}>Tap these numbers in order:</Text>
        <Text style={styles.prompt}>{challenge.prompt}</Text>

        <View style={styles.dots}>
          {challenge.sequence.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i < entered.length && styles.dotFilled]}
            />
          ))}
        </View>

        <View style={styles.pad}>
          {DIGITS.map((d) => (
            <PressableScale
              key={d}
              haptic={false}
              onPress={() => onDigit(d)}
              style={styles.key}
            >
              <Text style={styles.keyText}>{d}</Text>
            </PressableScale>
          ))}
        </View>

        <PressableScale haptic={false} onPress={close} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

export function ParentalGate() {
  const visible = useGate((s) => s.visible);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={useGate.getState().close}
    >
      {visible ? <GateCard /> : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(5,8,25,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  lock: { fontSize: 36 },
  title: { ...typography.heading, color: colors.text, marginTop: spacing.sm },
  hint: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
  prompt: {
    ...typography.title,
    color: colors.yellow,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  dots: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  dotFilled: { backgroundColor: colors.teal, borderColor: colors.teal },
  pad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    width: 3 * 72 + 2 * spacing.sm,
  },
  key: {
    width: 72,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
  },
  keyText: { ...typography.heading, color: colors.text },
  cancel: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  cancelText: { ...typography.body, color: colors.textMuted },
});
