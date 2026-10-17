import type { LetterItem } from "../data/alphabet";
import { alphabet } from "../data/alphabet";

export type FindRound = {
  target: LetterItem;
  options: string[];
  answerIndex: number;
};

export function makeRounds(count: number, optionsCount: number): FindRound[] {
  if (!Number.isInteger(count) || count < 0 || count > alphabet.length) {
    throw new RangeError("count must be an integer from 0 to 26");
  }
  if (
    !Number.isInteger(optionsCount) ||
    optionsCount < 1 ||
    optionsCount > alphabet.length
  ) {
    throw new RangeError("optionsCount must be an integer from 1 to 26");
  }

  const targets = shuffle(alphabet).slice(0, count);
  return targets.map((target) => {
    const distractors = shuffle(
      alphabet.filter((item) => item.letter !== target.letter),
    )
      .slice(0, optionsCount - 1)
      .map((item) => item.letter);
    const options = shuffle([target.letter, ...distractors]);

    return {
      target,
      options,
      answerIndex: options.indexOf(target.letter),
    };
  });
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
