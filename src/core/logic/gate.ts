export type Challenge = { prompt: string; sequence: number[] };

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

export function createChallenge(rand: () => number = Math.random): Challenge {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let index = 0; index < 3; index += 1) {
    const randomValue = rand();
    const boundedValue = Number.isFinite(randomValue)
      ? Math.min(Math.max(randomValue, 0), 1 - Number.EPSILON)
      : 0;
    const swapIndex =
      index + Math.floor(boundedValue * (digits.length - index));
    [digits[index], digits[swapIndex]] = [digits[swapIndex], digits[index]];
  }

  const sequence = digits.slice(0, 3);
  return {
    prompt: sequence.map((digit) => digitWords[digit]).join(", "),
    sequence,
  };
}

export function isCorrect(challenge: Challenge, entered: number[]): boolean {
  return (
    challenge.sequence.length === entered.length &&
    challenge.sequence.every((digit, index) => digit === entered[index])
  );
}
