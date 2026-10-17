import type { NumberItem } from "../data/numbers";
import { numbers } from "../data/numbers";

export type CountRound = {
  item: NumberItem;
  n: number;
  options: number[];
  answerIndex: number;
};

const numberValues = numbers.map((item) => item.n);

export function makeCountRounds(
  count: number,
  optionsCount: number,
): CountRound[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("count must be a non-negative integer");
  }
  if (
    !Number.isInteger(optionsCount) ||
    optionsCount < 1 ||
    optionsCount > numberValues.length
  ) {
    throw new RangeError("optionsCount must be an integer from 1 to 10");
  }

  const targets =
    count <= numberValues.length
      ? shuffle(numberValues).slice(0, count)
      : makeNonRepeatingSequence(count);

  return targets.map((n) => {
    const nearby = numberValues.filter(
      (value) => value !== n && Math.abs(value - n) <= 3,
    );
    const distant = numberValues.filter(
      (value) => value !== n && Math.abs(value - n) > 3,
    );
    const nearbyOptions = shuffle(nearby).slice(0, optionsCount - 1);
    const remainingCount = optionsCount - 1 - nearbyOptions.length;
    const wrongOptions = [
      ...nearbyOptions,
      ...shuffle(distant).slice(0, remainingCount),
    ];
    const options = shuffle([n, ...wrongOptions]);

    return {
      item: numbers[Math.floor(Math.random() * numbers.length)],
      n,
      options,
      answerIndex: options.indexOf(n),
    };
  });
}

function makeNonRepeatingSequence(count: number): number[] {
  const sequence: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const choices = numberValues.filter(
      (value) => value !== sequence[index - 1],
    );
    sequence.push(choices[Math.floor(Math.random() * choices.length)]);
  }
  return sequence;
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
