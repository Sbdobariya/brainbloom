import assert from "node:assert";

import { makeShapeRounds } from "./findShape";

for (let run = 0; run < 200; run += 1) {
  const rounds = makeShapeRounds(8, 4);
  assert.strictEqual(rounds.length, 8);
  assert.strictEqual(new Set(rounds.map((round) => round.target.id)).size, 8);

  for (const round of rounds) {
    assert.strictEqual(round.options.length, 4);
    assert.strictEqual(new Set(round.options).size, 4);
    assert.strictEqual(round.options[round.answerIndex], round.target.name);
  }
}

const extendedRounds = makeShapeRounds(10, 6);
assert.strictEqual(extendedRounds.length, 10);
for (let index = 0; index < extendedRounds.length; index += 1) {
  const round = extendedRounds[index];
  assert.strictEqual(round.options.length, 6);
  assert.strictEqual(new Set(round.options).size, 6);
  assert.strictEqual(round.options[round.answerIndex], round.target.name);
  if (index > 0) {
    assert.notStrictEqual(round.target.id, extendedRounds[index - 1].target.id);
  }
}
