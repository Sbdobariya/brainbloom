import assert from "node:assert";

import { makeColorRounds } from "./findColor";

for (let run = 0; run < 200; run += 1) {
  const rounds = makeColorRounds(8, 4);
  assert.strictEqual(rounds.length, 8);
  assert.strictEqual(new Set(rounds.map((round) => round.target.id)).size, 8);

  for (const round of rounds) {
    assert.strictEqual(round.options.length, 4);
    assert.strictEqual(
      new Set(round.options.map((option) => option.id)).size,
      4,
    );
    assert.strictEqual(round.options[round.answerIndex].id, round.target.id);
  }
}
