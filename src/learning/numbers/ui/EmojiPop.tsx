import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";

type Props = { emoji: string; index: number };

export function EmojiPop({ emoji, index }: Props) {
  const s = useSharedValue(0);

  useEffect(() => {
    // Each picture pops in a moment after the one before it
    s.value = withDelay(
      index * 90,
      withSpring(1, { damping: 7, stiffness: 180 }),
    );
  }, [index, s]);

  const style = useAnimatedStyle(() => ({
    opacity: s.value,
    transform: [{ scale: s.value }, { rotate: `${(1 - s.value) * -25}deg` }],
  }));

  return <Animated.Text style={[styles.emoji, style]}>{emoji}</Animated.Text>;
}

const styles = StyleSheet.create({
  emoji: {
    fontSize: 44,
    width: 64,
    height: 64,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 64,
  },
});
