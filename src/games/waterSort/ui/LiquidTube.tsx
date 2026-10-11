import { PressableScale } from "@/core/components/PressableScale";
import { colors } from "@/core/theme";
import {
  Canvas,
  Group,
  Rect,
  RoundedRect,
  rect,
  rrect,
} from "@shopify/react-native-skia";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { CAPACITY } from "../logic/waterSort";

const PAD = 6;

type SlotProps = {
  index: number; // 0 = bottom slot
  color: string | null; // null = empty slot
  slotH: number;
  width: number;
  height: number;
};

// One layer of liquid. Hooks work inside Skia canvases.
function LiquidSlot({ index, color, slotH, width, height }: SlotProps) {
  const fill = useSharedValue(color ? 1 : 0);
  // Keep the last color so a draining layer doesn't turn transparent mid-animation
  const lastColor = useRef(color ?? "transparent");
  if (color) lastColor.current = color;

  useEffect(() => {
    // Layers that appear wait a moment, so it looks like the liquid arrives
    // after it has left the other tube
    fill.value = withDelay(
      color ? 140 : 0,
      withTiming(color ? 1 : 0, { duration: 240 }),
    );
  }, [color, fill]);

  const y = useDerivedValue(
    () => height - PAD - slotH * index - slotH * fill.value,
  );
  const h = useDerivedValue(() => slotH * fill.value);

  return (
    <Rect
      x={PAD}
      y={y}
      width={width - PAD * 2}
      height={h}
      color={lastColor.current}
    />
  );
}

type Props = {
  layers: string[]; // colors, bottom to top
  selected: boolean;
  width: number;
  height: number;
  onPress: () => void;
};

export function LiquidTube({
  layers,
  selected,
  width,
  height,
  onPress,
}: Props) {
  const slotH = (height - PAD * 2) / CAPACITY;
  const lift = useSharedValue(0);

  // Selected tubes hop up so the player can see what is picked
  useEffect(() => {
    lift.value = withSpring(selected ? -22 : 0, {
      damping: 18,
      stiffness: 220,
    });
  }, [selected, lift]);

  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }],
  }));

  return (
    <Animated.View style={[{ width, height }, liftStyle]}>
      <PressableScale
        onPress={onPress}
        haptic={false}
        scaleTo={0.96}
        style={styles.fill}
      >
        <View pointerEvents="none" style={styles.fill}>
          <Canvas style={{ width, height }}>
            {/* Glass background */}
            <RoundedRect
              x={0}
              y={0}
              width={width}
              height={height}
              r={18}
              color={colors.bgSoft}
            />

            {/* Liquid, clipped to the tube shape */}
            <Group
              clip={rrect(
                rect(PAD, PAD, width - PAD * 2, height - PAD * 2),
                14,
                14,
              )}
            >
              {Array.from({ length: CAPACITY }, (_, i) => (
                <LiquidSlot
                  key={i}
                  index={i}
                  color={layers[i] ?? null}
                  slotH={slotH}
                  width={width}
                  height={height}
                />
              ))}
            </Group>

            {/* Glass shine and outline on top */}
            <Rect
              x={PAD + 5}
              y={PAD + 10}
              width={4}
              height={height - PAD * 2 - 24}
              color="rgba(255,255,255,0.14)"
            />
            <RoundedRect
              x={1.5}
              y={1.5}
              width={width - 3}
              height={height - 3}
              r={18}
              style="stroke"
              strokeWidth={3}
              color={selected ? colors.yellow : colors.cardBorder}
            />
          </Canvas>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
