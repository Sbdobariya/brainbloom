import { colors, radius } from "@/core/theme";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { PressableScale } from "./PressableScale";

type Props = { value: boolean; onChange: (v: boolean) => void };

const W = 64;
const H = 36;
const KNOB = 28;
const PAD = 4;

export function ToggleSwitch({ value, onChange }: Props) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, { damping: 16, stiffness: 220 });
  }, [value, progress]);

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.cardBorder, colors.green],
    ),
  }));
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: PAD + progress.value * (W - KNOB - PAD * 2) }],
  }));

  return (
    <PressableScale
      onPress={() => onChange(!value)}
      haptic={false}
      scaleTo={0.94}
    >
      <Animated.View style={[styles.track, track]}>
        <Animated.View style={[styles.knob, knob]} />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  track: {
    width: W,
    height: H,
    borderRadius: radius.pill,
    justifyContent: "center",
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: colors.text,
  },
});
