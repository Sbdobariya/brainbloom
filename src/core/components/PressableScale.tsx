import { haptic as feedbackHaptic, playSound } from "@/core/audio/feedback";
import React from "react";
import {
  Pressable,
  StyleProp,
  ViewStyle,
  type AccessibilityRole,
  type AccessibilityState,
  type GestureResponderEvent,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
  sound?: boolean;
  disabled?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  onPressIn?: (event: GestureResponderEvent) => void;
  onPressOut?: (event: GestureResponderEvent) => void;
};

export function PressableScale({
  children,
  onPress,
  style,
  scaleTo = 0.94,
  haptic = true,
  sound = false,
  disabled = false,
  accessibilityRole,
  accessibilityLabel,
  accessibilityState,
  onPressIn,
  onPressOut,
}: Props) {
  // Lives on the UI thread. Changing it does NOT re-render React.
  const scale = useSharedValue(1);

  // Maps the shared value to a style. Re-runs on the UI thread when scale changes.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      onPressIn={(event) => {
        // withSpring animates to the target with a natural bounce
        scale.value = withSpring(scaleTo, { damping: 15, stiffness: 300 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, { damping: 10, stiffness: 250 });
        onPressOut?.(event);
      }}
      onPress={() => {
        if (haptic) feedbackHaptic.tap();
        if (sound) playSound("tap");
        onPress?.();
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
