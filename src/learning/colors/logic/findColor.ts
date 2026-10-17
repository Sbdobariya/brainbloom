import type { ColorItem } from "../data/colors";
import { colorItems } from "../data/colors";

export type ColorRound = {
  target: ColorItem;
  options: ColorItem[];
  answerIndex: number;
};

export function makeColorRounds(
  count: number,
  optionsCount: number,
): ColorRound[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("count must be a non-negative integer");
  }
  if (
    !Number.isInteger(optionsCount) ||
    optionsCount < 1 ||
    optionsCount > colorItems.length
  ) {
    throw new RangeError("optionsCount must be an integer from 1 to 8");
  }

  const targets =
    count <= colorItems.length
      ? shuffle(colorItems).slice(0, count)
      : makeNonRepeatingSequence(count);

  return targets.map((target) => {
    const distractors = shuffle(
      colorItems.filter((item) => item.id !== target.id),
    ).slice(0, optionsCount - 1);
    const options = shuffle([target, ...distractors]);
    return {
      target,
      options,
      answerIndex: options.findIndex((option) => option.id === target.id),
    };
  });
}

function makeNonRepeatingSequence(count: number): ColorItem[] {
  const sequence: ColorItem[] = [];
  while (sequence.length < count) {
    const batch = shuffle(colorItems);
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
