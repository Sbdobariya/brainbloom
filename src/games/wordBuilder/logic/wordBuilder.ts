import {
    categoryInfo,
    words,
    type Category,
    type WordEntry,
} from "../data/words";

export type Tile = { id: number; letter: string };

export function pickRound(count: number): WordEntry[] {
  const roundSize = Math.min(Math.max(Math.floor(count), 0), words.length);
  if (roundSize === 0) {
    return [];
  }

  const categories = shuffle(Object.keys(categoryInfo) as Category[]);
  const buckets = new Map<Category, WordEntry[]>();
  for (const category of categories) {
    buckets.set(
      category,
      shuffle(words.filter((entry) => entry.category === category)),
    );
  }

  const round: WordEntry[] = [];
  while (round.length < roundSize) {
    for (const category of categories) {
      const entry = buckets.get(category)?.pop();
      if (entry !== undefined) {
        round.push(entry);
      }
      if (round.length === roundSize) {
        break;
      }
    }
  }

  return round;
}

export function scrambleLetters(word: string): Tile[] {
  const letters = Array.from(word);
  const tiles = shuffle(letters.map((letter, id) => ({ id, letter })));

  if (
    tiles.length > 1 &&
    new Set(letters).size > 1 &&
    tiles.every((tile, index) => tile.letter === letters[index])
  ) {
    const firstTile = tiles.shift();
    if (firstTile !== undefined) {
      tiles.push(firstTile);
    }
  }

  return tiles;
}

export function isCorrect(entry: WordEntry, placed: Tile[]): boolean {
  return placed.map((tile) => tile.letter).join("") === entry.word;
}

export function calcPoints(
  wordLength: number,
  secondsLeft: number,
  streak: number,
): number {
  return wordLength * 10 + secondsLeft * 2 + streak * 5;
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
