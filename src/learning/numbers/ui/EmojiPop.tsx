import { useResponsive } from "@/core/theme/responsive";
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
  const { s: scaleSize } = useResponsive();
  const pop = useSharedValue(0);
  const cellSize = Math.max(56, scaleSize(64));
  const responsiveStyles = StyleSheet.create({
    emoji: { fontSize: scaleSize(44) },
    cell: { width: cellSize, height: cellSize, lineHeight: cellSize },
  });

  useEffect(() => {
    // Each picture pops in a moment after the one before it
    pop.value = withDelay(
      index * 90,
      withSpring(1, { damping: 7, stiffness: 180 }),
    );
  }, [index, pop]);

  const style = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [
      { scale: pop.value },
      { rotate: `${(1 - pop.value) * -25}deg` },
    ],
  }));

  return (
    <Animated.Text
      style={[
        styles.emoji,
        responsiveStyles.emoji,
        responsiveStyles.cell,
        style,
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  emoji: {
    textAlign: "center",
    textAlignVertical: "center",
  },
});
