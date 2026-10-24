import { colors } from "@/core/theme";
import {
  Blur,
  Canvas,
  Circle,
  Path,
  RoundedRect,
  Skia,
} from "@shopify/react-native-skia";
import React, { useMemo } from "react";

const N = 4; // the icon is a tiny 4x4 board, every square is covered

// Each pipe is a list of [column, row] cells. Together they fill all 16 squares.
const PIPES: { color: string; cells: [number, number][] }[] = [
  {
    color: colors.red,
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [3, 1],
    ],
  },
  {
    color: colors.blue,
    cells: [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 3],
    ],
  },
  {
    color: colors.yellow,
    cells: [
      [1, 1],
      [2, 1],
      [2, 2],
      [1, 2],
    ],
  },
  {
    color: colors.green,
    cells: [
      [2, 3],
      [3, 3],
      [3, 2],
    ],
  },
];

type Props = { size: number };

export function FlowIcon({ size }: Props) {
  const cell = size / N;

  // Build one Skia path per pipe through the centre of each cell
  const paths = useMemo(
    () =>
      PIPES.map((pipe) => {
        const p = Skia.Path.Make();
        pipe.cells.forEach(([c, r], i) => {
          const x = (c + 0.5) * cell;
          const y = (r + 0.5) * cell;
          if (i === 0) p.moveTo(x, y);
          else p.lineTo(x, y);
        });
        return p;
      }),
    [cell],
  );

  return (
    <Canvas style={{ width: size, height: size }}>
      {/* Dark tile */}
      <RoundedRect
        x={1}
        y={1}
        width={size - 2}
        height={size - 2}
        r={size * 0.22}
        color="#070A1E"
      />
      <RoundedRect
        x={1}
        y={1}
        width={size - 2}
        height={size - 2}
        r={size * 0.22}
        color={colors.cardBorder}
        style="stroke"
        strokeWidth={1.5}
      />

      {PIPES.map((pipe, i) => (
        <React.Fragment key={i}>
          {/* Soft neon glow underneath */}
          <Path
            path={paths[i]}
            color={pipe.color}
            style="stroke"
            strokeWidth={cell * 0.42}
            strokeCap="round"
            strokeJoin="round"
            opacity={0.5}
          >
            <Blur blur={cell * 0.12} />
          </Path>
          {/* Solid pipe */}
          <Path
            path={paths[i]}
            color={pipe.color}
            style="stroke"
            strokeWidth={cell * 0.26}
            strokeCap="round"
            strokeJoin="round"
          />
          {/* Dots at both ends, with a small shine */}
          {[pipe.cells[0], pipe.cells[pipe.cells.length - 1]].map(
            ([c, r], k) => (
              <React.Fragment key={k}>
                <Circle
                  cx={(c + 0.5) * cell}
                  cy={(r + 0.5) * cell}
                  r={cell * 0.24}
                  color={pipe.color}
                />
                <Circle
                  cx={(c + 0.5) * cell - cell * 0.07}
                  cy={(r + 0.5) * cell - cell * 0.07}
                  r={cell * 0.06}
                  color="rgba(255,255,255,0.55)"
                />
              </React.Fragment>
            ),
          )}
        </React.Fragment>
      ))}
    </Canvas>
  );
}
