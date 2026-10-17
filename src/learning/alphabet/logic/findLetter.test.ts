import assert from "node:assert";

import { makeRounds } from "./findLetter";

for (let run = 0; run < 200; run += 1) {
  for (const [count, optionsCount] of [
    [10, 4],
    [26, 6],
  ] as const) {
    const rounds = makeRounds(count, optionsCount);
    assert.strictEqual(rounds.length, count);
    assert.strictEqual(
      new Set(rounds.map((round) => round.target.letter)).size,
      count,
    );

    for (const round of rounds) {
      assert.strictEqual(round.options.length, optionsCount);
      assert.strictEqual(new Set(round.options).size, optionsCount);
      assert.strictEqual(round.options[round.answerIndex], round.target.letter);
      assert.strictEqual(
        round.target.letter,
        round.target.letter.toUpperCase(),
      );
    }
  }
}
