import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
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
  disabled?: boolean;
};

export function PressableScale({
  children,
  onPress,
  style,
  scaleTo = 0.94,
  haptic = true,
  disabled = false,
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
      onPressIn={() => {
        // withSpring animates to the target with a natural bounce
        scale.value = withSpring(scaleTo, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 250 });
      }}
      onPress={() => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
