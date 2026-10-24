import { PressableScale } from "@/core/components/PressableScale";
import { colors, radius } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
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

type SlotProps = {
  index: number; // 0 = bottom slot
  color: string | null; // null = empty slot
  slotH: number;
  width: number;
  height: number;
  pad: number;
};

// One layer of liquid. Hooks work inside Skia canvases.
function LiquidSlot({ index, color, slotH, width, height, pad }: SlotProps) {
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
    () => height - pad - slotH * index - slotH * fill.value,
  );
  const h = useDerivedValue(() => slotH * fill.value);

  return (
    <Rect
      x={pad}
      y={y}
      width={width - pad * 2}
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
  const { s } = useResponsive();
  const pad = s(6);
  const tubeRadius = s(radius.md);
  const innerRadius = s(radius.sm);
  const slotH = (height - pad * 2) / CAPACITY;
  const lift = useSharedValue(0);
  const responsiveStyles = StyleSheet.create({
    tube: { width, height },
    canvas: { width, height },
  });

  // Selected tubes hop up so the player can see what is picked
  useEffect(() => {
    lift.value = withSpring(selected ? -s(22) : 0, {
      damping: 18,
      stiffness: 220,
    });
  }, [selected, lift]);

  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }],
  }));

  return (
    <Animated.View style={[responsiveStyles.tube, liftStyle]}>
      <PressableScale
        onPress={onPress}
        haptic={false}
        scaleTo={0.96}
        style={styles.fill}
      >
        <View pointerEvents="none" style={styles.fill}>
          <Canvas style={responsiveStyles.canvas}>
            {/* Glass background */}
            <RoundedRect
              x={0}
              y={0}
              width={width}
              height={height}
              r={tubeRadius}
              color={colors.bgSoft}
            />

            {/* Liquid, clipped to the tube shape */}
            <Group
              clip={rrect(
                rect(pad, pad, width - pad * 2, height - pad * 2),
                innerRadius,
                innerRadius,
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
                  pad={pad}
                />
              ))}
            </Group>

            {/* Glass shine and outline on top */}
            <Rect
              x={pad + s(5)}
              y={pad + s(10)}
              width={s(4)}
              height={height - pad * 2 - s(24)}
              color="rgba(255,255,255,0.14)"
            />
            <RoundedRect
              x={s(1.5)}
              y={s(1.5)}
              width={width - s(3)}
              height={height - s(3)}
              r={tubeRadius}
              style="stroke"
              strokeWidth={s(3)}
              color={selected ? colors.yellow : colors.cardBorder}
            />
          </Canvas>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
