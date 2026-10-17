import type { ShapeItem } from "../data/shapes";
import { shapes } from "../data/shapes";

export type ShapeRound = {
  target: ShapeItem;
  options: string[];
  answerIndex: number;
};

export function makeShapeRounds(
  count: number,
  optionsCount: number,
): ShapeRound[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("count must be a non-negative integer");
  }
  if (
    !Number.isInteger(optionsCount) ||
    optionsCount < 1 ||
    optionsCount > shapes.length
  ) {
    throw new RangeError("optionsCount must be an integer from 1 to 8");
  }

  const targets =
    count <= shapes.length
      ? shuffle(shapes).slice(0, count)
      : makeNonRepeatingSequence(count);

  return targets.map((target) => {
    const distractors = shuffle(
      shapes.filter((shape) => shape.id !== target.id),
    )
      .slice(0, optionsCount - 1)
      .map((shape) => shape.name);
    const options = shuffle([target.name, ...distractors]);

    return {
      target,
      options,
      answerIndex: options.indexOf(target.name),
    };
  });
}

function makeNonRepeatingSequence(count: number): ShapeItem[] {
  const sequence: ShapeItem[] = [];
  while (sequence.length < count) {
    const batch = shuffle(shapes);
    if (
      sequence.length > 0 &&
      batch[0].id === sequence[sequence.length - 1].id
    ) {
      [batch[0], batch[1]] = [batch[1], batch[0]];
    }
    sequence.push(...batch);
  }
  return sequence.slice(0, count);
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = items.slice();
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}
