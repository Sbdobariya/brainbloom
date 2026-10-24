import { haptic, playSound, speak } from "@/core/audio/feedback";
import { HOW_TO_PLAY } from "@/core/howToPlay/howToPlayData";
import { typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Props = { id: string; visible: boolean; onClose: () => void };

export function HowToPlayOverlay({ id, visible, onClose }: Props) {
  const { s } = useResponsive();
  const data = HOW_TO_PLAY[id];
  const [i, setI] = useState(0);

  // hand animation: x/y position, press scale, ripple
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const press = useSharedValue(1);
  const ripple = useSharedValue(0);

  const step = data?.steps[Math.min(i, (data?.steps.length ?? 1) - 1)];
  const last = !data || i >= data.steps.length - 1;

  useEffect(() => {
    if (visible) setI(0);
  }, [visible]);

  useEffect(() => {
    if (!visible || !step) return;
    speak(step.instruction);

    const ease = Easing.inOut(Easing.quad);
    if (step.gesture === "drag") {
      x.value = -s(60);
      y.value = 0;
      x.value = withRepeat(
        withSequence(
          withDelay(500, withTiming(s(60), { duration: 1100, easing: ease })),
          withDelay(400, withTiming(-s(60), { duration: 0 })),
        ),
        -1,
      );
      press.value = withTiming(0.88, { duration: 200 });
      ripple.value = 0;
    } else {
      x.value = 0;
      y.value = s(30);
      y.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 500, easing: ease }),
          withTiming(s(30), { duration: 500, easing: ease }),
          withDelay(300, withTiming(s(30), { duration: 0 })),
        ),
        -1,
      );
      press.value = withRepeat(
        withSequence(
          withDelay(450, withTiming(0.82, { duration: 120 })),
          withTiming(1, { duration: 200 }),
          withDelay(600, withTiming(1, { duration: 0 })),
        ),
        -1,
      );
      ripple.value = withRepeat(
        withSequence(
          withDelay(450, withTiming(1, { duration: 500 })),
          withTiming(0, { duration: 0 }),
          withDelay(500, withTiming(0, { duration: 0 })),
        ),
        -1,
      );
    }
  }, [visible, i, step, s, x, y, press, ripple]);

  const hand = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: press.value },
    ],
  }));
  const ring = useAnimatedStyle(() => ({
    opacity: (1 - ripple.value) * 0.7 * (ripple.value > 0 ? 1 : 0),
    transform: [{ scale: 0.5 + ripple.value }],
  }));

  if (!data || !step) return null;

  const next = () => {
    haptic.tap();
    playSound("tap");
    if (last) onClose();
    else setI((n) => n + 1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              borderRadius: s(32),
              padding: s(20),
              width: "90%",
              maxWidth: 460,
            },
          ]}
        >
          <Text style={[styles.title, { fontSize: s(22) }]}>How to play</Text>
          <Text style={[styles.game, { fontSize: s(16) }]}>{data.title}</Text>

          {/* demo stage */}
          <View
            style={[
              styles.stage,
              { height: s(150), borderRadius: s(24), marginTop: s(14) },
            ]}
          >
            <View style={styles.demoRow}>
              <Text style={{ fontSize: s(54) }}>{step.demo}</Text>
              {step.target ? (
                <Text style={{ fontSize: s(54) }}>{step.target}</Text>
              ) : null}
            </View>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ring,
                { width: s(70), height: s(70), borderRadius: s(35) },
                ring,
              ]}
            />
            <Animated.Text
              pointerEvents="none"
              style={[styles.hand, { fontSize: s(48), bottom: s(18) }, hand]}
            >
              👆
            </Animated.Text>
          </View>

          <Text
            style={[styles.instruction, { fontSize: s(19), marginTop: s(16) }]}
          >
            {step.instruction}
          </Text>

          {/* step dots */}
          {data.steps.length > 1 && (
            <View style={[styles.dots, { marginTop: s(10) }]}>
              {data.steps.map((_, n) => (
                <View key={n} style={[styles.dot, n === i && styles.dotOn]} />
              ))}
            </View>
          )}

          <View style={[styles.buttons, { marginTop: s(18), gap: s(10) }]}>
            <Pressable
              onPress={() => speak(step.instruction)}
              accessibilityRole="button"
              accessibilityLabel="Hear it again"
              style={[
                styles.speaker,
                {
                  width: Math.max(56, s(56)),
                  height: Math.max(56, s(56)),
                  borderRadius: s(28),
                },
              ]}
            >
              <Text style={{ fontSize: s(26) }}>🔊</Text>
            </Pressable>
            <Pressable
              onPress={next}
              accessibilityRole="button"
              style={[
                styles.go,
                { minHeight: Math.max(56, s(56)), borderRadius: s(28) },
              ]}
            >
              <Text style={[styles.goText, { fontSize: s(20) }]}>
                {last ? "Let's play! 🎮" : "Next ➜"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(5,8,30,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#1B2350",
    borderWidth: 3,
    borderColor: "#FFB400",
    alignItems: "center",
  },
  title: { ...typography.heading, color: "#FFFFFF" },
  game: { ...typography.body, color: "#FFB400" },
  stage: {
    width: "100%",
    backgroundColor: "#0F1538",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  demoRow: { flexDirection: "row", gap: 24, alignItems: "center" },
  ring: { position: "absolute", borderWidth: 4, borderColor: "#FFFFFF" },
  hand: { position: "absolute" },
  instruction: { ...typography.body, color: "#FFFFFF", textAlign: "center" },
  dots: { flexDirection: "row", gap: 8 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotOn: { backgroundColor: "#FFB400" },
  buttons: { flexDirection: "row", alignItems: "center", width: "100%" },
  speaker: {
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
  },
  go: {
    flex: 1,
    backgroundColor: "#22C7A9",
    alignItems: "center",
    justifyContent: "center",
  },
  goText: { ...typography.button, color: "#FFFFFF" },
});
