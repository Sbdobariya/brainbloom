import { colors } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import {
  Canvas,
  Circle,
  Path,
  RoundedRect,
  Skia,
} from "@shopify/react-native-skia";
import React, { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { Level, Paths } from "../logic/freeFlow";

type Props = {
  level: Level;
  paths: Paths;
  boardPx: number;
  palette: string[];
  onStart: (cell: number) => void;
  onMove: (cell: number) => void;
  onEnd: () => void;
};

export function FreeFlowBoard({
  level,
  paths,
  boardPx,
  palette,
  onStart,
  onMove,
  onEnd,
}: Props) {
  const { size, pairs } = level;
  const { s } = useResponsive();
  const gridInset = s(2);
  const gridRadius = s(10);
  const cell = Math.floor(boardPx / size);
  const responsiveStyles = StyleSheet.create({
    board: { width: boardPx, height: boardPx },
  });

  // The gesture is created once. It calls the latest handlers through a ref,
  // so a re-render in the middle of a drag never uses stale state or resets it.
  const handlers = useRef({ onStart, onMove, onEnd });
  handlers.current = { onStart, onMove, onEnd };

  const pan = useMemo(() => {
    const cellAt = (x: number, y: number) => {
      const c = Math.floor(x / cell);
      const r = Math.floor(y / cell);
      return r < 0 || c < 0 || r >= size || c >= size ? -1 : r * size + c;
    };
    return Gesture.Pan()
      .runOnJS(true) // callbacks run on the JS thread, so they can set React state
      .minDistance(0) // start immediately on touch, not after a slop distance
      .onBegin((e) => {
        const i = cellAt(e.x, e.y);
        if (i >= 0) handlers.current.onStart(i);
      })
      .onUpdate((e) => {
        const i = cellAt(e.x, e.y);
        if (i >= 0) handlers.current.onMove(i);
      })
      .onFinalize(() => handlers.current.onEnd());
  }, [cell, size]);

  // One Skia path per color: a line through the center of every covered cell
  const strokes = useMemo(
    () =>
      paths.map((cells) => {
        if (cells.length < 2) return null;
        const p = Skia.Path.Make();
        cells.forEach((idx, k) => {
          const x = ((idx % size) + 0.5) * cell;
          const y = (Math.floor(idx / size) + 0.5) * cell;
          if (k === 0) p.moveTo(x, y);
          else p.lineTo(x, y);
        });
        return p;
      }),
    [paths, size, cell],
  );

  const center = (idx: number) => ({
    x: ((idx % size) + 0.5) * cell,
    y: (Math.floor(idx / size) + 0.5) * cell,
  });

  return (
    <GestureDetector gesture={pan}>
      <View style={responsiveStyles.board}>
        <Canvas style={responsiveStyles.board}>
          {/* Grid cells */}
          {Array.from({ length: size * size }, (_, i) => (
            <RoundedRect
              key={i}
              x={(i % size) * cell + gridInset}
              y={Math.floor(i / size) * cell + gridInset}
              width={cell - gridInset * 2}
              height={cell - gridInset * 2}
              r={gridRadius}
              color={colors.bgSoft}
            />
          ))}

          {/* Colored paths, drawn under the dots */}
          {strokes.map((p, i) =>
            p ? (
              <Path
                key={i}
                path={p}
                color={palette[i % palette.length]}
                style="stroke"
                strokeWidth={cell * 0.4}
                strokeCap="round"
                strokeJoin="round"
              />
            ) : null,
          )}

          {/* Endpoint dots */}
          {pairs.flatMap((pair, i) =>
            [pair.a, pair.b].map((idx) => {
              const { x, y } = center(idx);
              return (
                <React.Fragment key={`${i}-${idx}`}>
                  <Circle
                    cx={x}
                    cy={y}
                    r={cell * 0.3}
                    color={palette[i % palette.length]}
                  />
                  <Circle
                    cx={x - cell * 0.09}
                    cy={y - cell * 0.09}
                    r={cell * 0.07}
                    color="rgba(255,255,255,0.55)"
                  />
                </React.Fragment>
              );
            }),
          )}
        </Canvas>
      </View>
    </GestureDetector>
  );
}
