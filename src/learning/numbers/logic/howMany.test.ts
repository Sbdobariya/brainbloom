import assert from "node:assert";

import { makeCountRounds } from "./howMany";

for (let run = 0; run < 200; run += 1) {
  const rounds = makeCountRounds(10, 4);
  assert.strictEqual(rounds.length, 10);
  assert.strictEqual(new Set(rounds.map((round) => round.n)).size, 10);

  for (const round of rounds) {
    assert.strictEqual(round.options.length, 4);
    assert.strictEqual(new Set(round.options).size, 4);
    assert.strictEqual(round.options[round.answerIndex], round.n);
    assert.strictEqual(round.n >= 1 && round.n <= 10, true);
    assert.strictEqual(
      round.options.every((option) => option >= 1 && option <= 10),
      true,
    );
  }
}

const extendedRounds = makeCountRounds(26, 6);
assert.strictEqual(extendedRounds.length, 26);
for (let index = 1; index < extendedRounds.length; index += 1) {
  assert.notStrictEqual(extendedRounds[index].n, extendedRounds[index - 1].n);
}