import {
  Canvas,
  Circle,
  Oval,
  Path,
  RoundedRect,
  Skia,
} from "@shopify/react-native-skia";
import { useMemo } from "react";
import type { ShapeId } from "../data/shapes";

type Props = { id: ShapeId; size: number; color: string };

// Every shape is described in a 0..1 box and scaled to `size`,
// so one definition works at any size.
function buildPath(id: ShapeId, s: number) {
  const p = Skia.Path.Make();
  const poly = (pts: [number, number][]) => {
    pts.forEach(([x, y], i) =>
      i === 0 ? p.moveTo(x * s, y * s) : p.lineTo(x * s, y * s),
    );
    p.close();
  };

  if (id === "triangle") {
    poly([
      [0.5, 0.08],
      [0.95, 0.88],
      [0.05, 0.88],
    ]);
  } else if (id === "diamond") {
    poly([
      [0.5, 0.05],
      [0.92, 0.5],
      [0.5, 0.95],
      [0.08, 0.5],
    ]);
  } else if (id === "star") {
    // 5 outer points and 5 inner points, alternating around a centre
    const pts: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 0.48 : 0.21;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push([0.5 + r * Math.cos(a), 0.54 + r * Math.sin(a)]);
    }
    poly(pts);
  } else if (id === "heart") {
    // Two bumps at the top, one point at the bottom, drawn with curves
    p.moveTo(0.5 * s, 0.92 * s);
    p.cubicTo(0.1 * s, 0.62 * s, 0.0 * s, 0.35 * s, 0.15 * s, 0.2 * s);
    p.cubicTo(0.28 * s, 0.07 * s, 0.45 * s, 0.12 * s, 0.5 * s, 0.28 * s);
    p.cubicTo(0.55 * s, 0.12 * s, 0.72 * s, 0.07 * s, 0.85 * s, 0.2 * s);
    p.cubicTo(1.0 * s, 0.35 * s, 0.9 * s, 0.62 * s, 0.5 * s, 0.92 * s);
    p.close();
  } else {
    return null;
  }
  return p;
}

export function ShapeView({ id, size, color }: Props) {
  const s = size;
  const path = useMemo(() => buildPath(id, s), [id, s]);

  return (
    <Canvas style={{ width: s, height: s }}>
      {id === "circle" && (
        <Circle cx={s / 2} cy={s / 2} r={s * 0.45} color={color} />
      )}
      {id === "square" && (
        <RoundedRect
          x={s * 0.12}
          y={s * 0.12}
          width={s * 0.76}
          height={s * 0.76}
          r={s * 0.05}
          color={color}
        />
      )}
      {id === "rectangle" && (
        <RoundedRect
          x={s * 0.04}
          y={s * 0.27}
          width={s * 0.92}
          height={s * 0.46}
          r={s * 0.05}
          color={color}
        />
      )}
      {id === "oval" && (
        <Oval
          x={s * 0.04}
          y={s * 0.2}
          width={s * 0.92}
          height={s * 0.6}
          color={color}
        />
      )}
      {path && <Path path={path} color={color} />}
    </Canvas>
  );
}
