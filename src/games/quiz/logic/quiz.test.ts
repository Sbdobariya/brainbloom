import assert from "node:assert";

import { questionBank, type Question } from "../data/questions";
import {
  calcQuizPoints,
  hideTwoWrong,
  makeMathQuestion,
  pickQuestions,
  shuffleOptions,
} from "./quiz";

const sourceQuestion = questionBank[0];
const shuffledQuestion = shuffleOptions(sourceQuestion);
assert.notStrictEqual(shuffledQuestion, sourceQuestion);
assert.notStrictEqual(shuffledQuestion.options, sourceQuestion.options);
assert.strictEqual(
  shuffledQuestion.options[shuffledQuestion.answerIndex],
  sourceQuestion.options[sourceQuestion.answerIndex],
);

for (const level of [1, 2, 3] as const) {
  for (let run = 0; run < 200; run += 1) {
    const question = makeMathQuestion(level);
    const match = question.prompt.match(/^(\d+) ([+−×]) (\d+) = \?$/);
    assert.notStrictEqual(match, null);
    const first = Number(match?.[1]);
    const operator = match?.[2];
    const second = Number(match?.[3]);
    const expectedAnswer =
      operator === "+"
        ? first + second
        : operator === "−"
          ? first - second
          : first * second;

    assert.strictEqual(Number(question.options[question.answerIndex]), expectedAnswer);
    assert.strictEqual(question.options.length, 4);
    assert.strictEqual(new Set(question.options).size, 4);
    assert.strictEqual(question.options.every((option) => Number(option) >= 0), true);
  }
}

const questions = pickQuestions(20, 2);
assert.strictEqual(questions.length, 20);
assert.strictEqual(new Set(questions.map((question) => question.id)).size, questions.length);
assert.strictEqual(
  new Set(questions.map((question) => question.prompt)).size,
  questions.length,
);
assert.strictEqual(
  questions.every((question) => question.options.length === 4),
  true,
);

const question: Question = questionBank[0];
for (let run = 0; run < 50; run += 1) {
  const hidden = hideTwoWrong(question);
  assert.strictEqual(hidden.length, 2);
  assert.strictEqual(new Set(hidden).size, 2);
  assert.strictEqual(hidden.includes(question.answerIndex), false);
}

assert.strictEqual(calcQuizPoints(12, 3), 37);