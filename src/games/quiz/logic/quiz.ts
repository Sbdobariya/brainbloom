import { questionBank, type Question } from "../data/questions";

export function shuffleOptions(q: Question): Question {
  const order = shuffle(q.options.map((_, index) => index));
  return {
    ...q,
    options: order.map((index) => q.options[index]),
    answerIndex: order.indexOf(q.answerIndex),
  };
}

export function makeMathQuestion(level: 1 | 2 | 3): Question {
  let first: number;
  let second: number;
  let operator: "+" | "−" | "×";

  if (level === 1) {
    operator = Math.random() < 0.5 ? "+" : "−";
    first = randomInt(0, 20);
    second = operator === "+" ? randomInt(0, 20 - first) : randomInt(0, first);
  } else if (level === 2) {
    operator = "×";
    first = randomInt(1, 10);
    second = randomInt(1, 10);
  } else {
    const operation = randomInt(0, 2);
    operator = operation === 0 ? "×" : operation === 1 ? "+" : "−";

    if (operator === "×") {
      first = randomInt(1, 12);
      second = randomInt(1, 12);
    } else if (operator === "+") {
      first = randomInt(10, 89);
      second = randomInt(10, 99 - first);
    } else {
      first = randomInt(20, 99);
      second = randomInt(10, first - 10);
    }
  }

  const answer = calculate(first, second, operator);
  const wrongAnswers = getWrongAnswers(first, second, operator, answer);
  const prompt = `${first} ${operator} ${second} = ?`;

  return shuffleOptions({
    id: `math-${first}-${operator}-${second}`,
    category: "math",
    prompt,
    options: [String(answer), ...wrongAnswers.map(String)],
    answerIndex: 0,
  });
}

export function pickQuestions(count: number, level: 1 | 2 | 3): Question[] {
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (total === 0) {
    return [];
  }

  const desiredMathCount = Math.round(total * 0.4);
  const bankCount = Math.min(total - desiredMathCount, questionBank.length);
  const selectedBank = shuffle(questionBank)
    .slice(0, bankCount)
    .map(shuffleOptions);
  const usedPrompts = new Set(selectedBank.map((question) => question.prompt));
  const generated: Question[] = [];

  while (generated.length < total - selectedBank.length) {
    const question = makeMathQuestion(level);
    if (!usedPrompts.has(question.prompt)) {
      usedPrompts.add(question.prompt);
      generated.push(question);
    }
  }

  return shuffle([...selectedBank, ...generated]);
}

export function hideTwoWrong(q: Question): number[] {
  const wrongIndexes = q.options
    .map((_, index) => index)
    .filter((index) => index !== q.answerIndex);
  return shuffle(wrongIndexes).slice(0, 2);
}

export function calcQuizPoints(secondsLeft: number, streak: number): number {
  return 10 + secondsLeft + streak * 5;
}

function randomInt(minimum: number, maximum: number): number {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function calculate(first: number, second: number, operator: "+" | "−" | "×"): number {
  if (operator === "+") {
    return first + second;
  }
  if (operator === "−") {
    return first - second;
  }
  return first * second;
}

function getWrongAnswers(
  first: number,
  second: number,
  operator: "+" | "−" | "×",
  answer: number,
): number[] {
  const candidates = [
    first + second,
    first - second,
    second - first,
    first * second,
    Math.abs(first - second),
    first + 1,
    second + 1,
    first - 1,
    second - 1,
  ];
  const wrongAnswers = new Set<number>();

  const addCandidate = (candidate: number) => {
    if (candidate >= 0 && candidate !== answer) {
      wrongAnswers.add(candidate);
    }
  };

  for (const candidate of candidates) {
    addCandidate(candidate);
  }

  for (let difference = 1; wrongAnswers.size < 3; difference += 1) {
    addCandidate(answer - difference);
    addCandidate(answer + difference);
  }

  return shuffle(Array.from(wrongAnswers)).slice(0, 3);
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = items.slice();
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}