import { colors, radius } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
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

export function ToggleSwitch({ value, onChange }: Props) {
  const { s } = useResponsive();
  const width = Math.max(64, s(64));
  const height = Math.max(36, s(36));
  const knobSize = Math.min(height - s(8), Math.max(28, s(28)));
  const pad = Math.max(4, s(4));
  const hitSize = Math.max(56, s(56));
  const responsiveStyles = StyleSheet.create({
    hitTarget: {
      minWidth: hitSize,
      minHeight: hitSize,
      width: hitSize,
      height: hitSize,
      alignItems: "center",
      justifyContent: "center",
    },
    track: { width, height, borderRadius: s(radius.pill) },
    knob: {
      width: knobSize,
      height: knobSize,
      borderRadius: knobSize / 2,
    },
  });
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
    transform: [
      { translateX: pad + progress.value * (width - knobSize - pad * 2) },
    ],
  }));

  return (
    <PressableScale
      onPress={() => onChange(!value)}
      haptic={false}
      scaleTo={0.94}
      style={responsiveStyles.hitTarget}
    >
      <Animated.View style={[styles.track, responsiveStyles.track, track]}>
        <Animated.View style={[styles.knob, responsiveStyles.knob, knob]} />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: radius.pill,
    justifyContent: "center",
  },
  knob: {
    backgroundColor: colors.text,
  },
});
