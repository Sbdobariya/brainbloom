import assert from "node:assert";

import { categoryInfo, words, type WordEntry } from "../data/words";
import {
    calcPoints,
    isCorrect,
    pickRound,
    scrambleLetters,
} from "./wordBuilder";

assert.strictEqual(
  new Set(words.map((entry) => entry.word)).size,
  words.length,
);
for (const category of Object.keys(
  categoryInfo,
) as (keyof typeof categoryInfo)[]) {
  const categoryWords = words.filter((entry) => entry.category === category);
  assert.strictEqual(categoryWords.length >= 10, true);
  for (const entry of categoryWords) {
    assert.strictEqual(entry.word.length >= 3 && entry.word.length <= 5, true);
    assert.strictEqual(entry.word, entry.word.toUpperCase());
  }
}

const round = pickRound(15);
assert.strictEqual(round.length, 15);
assert.strictEqual(
  new Set(round.map((entry) => entry.word)).size,
  round.length,
);
assert.strictEqual(
  new Set(round.map((entry) => entry.category)).size > 1,
  true,
);

const word = "APPLE";
const scrambled = scrambleLetters(word);
assert.deepStrictEqual(
  scrambled.map((tile) => tile.letter).sort(),
  Array.from(word).sort(),
);
assert.deepStrictEqual(
  scrambled.map((tile) => tile.id).sort((first, second) => first - second),
  [0, 1, 2, 3, 4],
);
assert.notStrictEqual(scrambled.map((tile) => tile.letter).join(""), word);

const entry: WordEntry = { word, category: "fruits", emoji: "🍎" };
const correctTiles = Array.from(word, (letter, id) => ({ id, letter }));
assert.strictEqual(isCorrect(entry, correctTiles), true);
assert.strictEqual(isCorrect(entry, correctTiles.slice(1)), false);
assert.strictEqual(calcPoints(5, 12, 3), 89);
