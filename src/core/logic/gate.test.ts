import assert from "node:assert";

import { createChallenge, isCorrect } from "./gate";

const digitWords = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

for (let run = 0; run < 200; run += 1) {
  const challenge = createChallenge();
  assert.strictEqual(challenge.sequence.length, 3);
  assert.strictEqual(new Set(challenge.sequence).size, 3);
  assert.strictEqual(
    challenge.sequence.every((digit) => digit >= 1 && digit <= 9),
    true,
  );
  assert.strictEqual(
    challenge.prompt,
    challenge.sequence.map((digit) => digitWords[digit]).join(", "),
  );
}

const challenge = createChallenge(() => 0);
assert.deepStrictEqual(challenge.sequence, [1, 2, 3]);
assert.strictEqual(challenge.prompt, "one, two, three");
assert.strictEqual(isCorrect(challenge, [1, 2, 3]), true);
assert.strictEqual(isCorrect(challenge, [2, 1, 3]), false);
assert.strictEqual(isCorrect(challenge, [1, 2]), false);
