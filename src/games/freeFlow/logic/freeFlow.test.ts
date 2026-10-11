import assert from "node:assert";

import {
    applyHint,
    coverage,
    createLevel,
    dragTo,
    emptyPaths,
    isPairConnected,
    isSolved,
    startPath,
    type Level,
    type Paths,
} from "./freeFlow";

function areAdjacent(first: number, second: number, size: number): boolean {
  const firstRow = Math.floor(first / size);
  const firstColumn = first % size;
  const secondRow = Math.floor(second / size);
  const secondColumn = second % size;
  return (
    Math.abs(firstRow - secondRow) + Math.abs(firstColumn - secondColumn) === 1
  );
}

function makeLevel(pairs: Level["pairs"]): Level {
  return { size: 3, pairs, solution: pairs.map(() => []) };
}

for (let levelNumber = 1; levelNumber <= 12; levelNumber += 1) {
  const level = createLevel(levelNumber);
  const solutionCells = level.solution.flat();
  assert.strictEqual(
    level.size,
    levelNumber <= 3 ? 5 : levelNumber <= 6 ? 6 : 7,
  );
  assert.strictEqual(solutionCells.length, level.size * level.size);
  assert.deepStrictEqual(
    solutionCells.slice().sort((first, second) => first - second),
    Array.from({ length: level.size * level.size }, (_, cell) => cell),
  );
  assert.strictEqual(new Set(solutionCells).size, solutionCells.length);
  assert.strictEqual(level.pairs.length, level.solution.length);

  for (let color = 0; color < level.pairs.length; color += 1) {
    const pair = level.pairs[color];
    const solution = level.solution[color];
    assert.strictEqual(solution.length >= 3, true);
    assert.strictEqual(solution[0], pair.a);
    assert.strictEqual(solution[solution.length - 1], pair.b);
    for (let index = 1; index < solution.length; index += 1) {
      assert.strictEqual(
        areAdjacent(solution[index - 1], solution[index], level.size),
        true,
      );
    }
  }

  let paths = emptyPaths(level);
  for (let color = 0; color < level.pairs.length; color += 1) {
    const started = startPath(level, paths, level.pairs[color].a);
    assert.notStrictEqual(started, null);
    paths = started!.paths;
    for (const cell of level.solution[color].slice(1)) {
      paths = dragTo(level, paths, color, cell);
    }
  }
  assert.strictEqual(isSolved(level, paths), true);
}

assert.deepStrictEqual(createLevel(42), createLevel(42));

const interactionLevel = makeLevel([
  { a: 0, b: 8 },
  { a: 2, b: 6 },
]);
const initialPaths = emptyPaths(interactionLevel);
const initialSnapshot = initialPaths.map((path) => path.slice());
const started = startPath(interactionLevel, initialPaths, 0);
assert.notStrictEqual(started, null);
assert.deepStrictEqual(initialPaths, initialSnapshot);
assert.deepStrictEqual(started!.paths[0], [0]);
assert.notStrictEqual(started!.paths, initialPaths);

const gapFilled = dragTo(interactionLevel, started!.paths, 0, 4);
assert.deepStrictEqual(gapFilled[0], [0, 3, 4]);

const backtracked = dragTo(interactionLevel, gapFilled, 0, 3);
assert.deepStrictEqual(backtracked[0], [0, 3]);

const endpointRejected = dragTo(interactionLevel, started!.paths, 0, 2);
assert.deepStrictEqual(endpointRejected[0], [0, 1]);
assert.strictEqual(
  endpointRejected[0].includes(interactionLevel.pairs[1].a),
  false,
);

const crossingLevel = makeLevel([
  { a: 0, b: 8 },
  { a: 6, b: 5 },
]);
const crossingPaths: Paths = [
  [0, 1],
  [6, 7, 4, 5],
];
const crossingSnapshot = crossingPaths.map((path) => path.slice());
const crossed = dragTo(crossingLevel, crossingPaths, 0, 4);
assert.deepStrictEqual(crossed, [
  [0, 1, 4],
  [6, 7],
]);
assert.deepStrictEqual(crossingPaths, crossingSnapshot);

const completeLevel = makeLevel([
  { a: 0, b: 2 },
  { a: 6, b: 8 },
]);
const completedPaths: Paths = [[0, 1, 2], []];
assert.strictEqual(dragTo(completeLevel, completedPaths, 0, 5), completedPaths);
assert.strictEqual(startPath(interactionLevel, initialPaths, 4), null);
assert.strictEqual(isPairConnected(completeLevel, completedPaths, 0), true);
assert.strictEqual(coverage(completeLevel, completedPaths), 3 / 9);

const hintLevel = createLevel(9);
const hintInput = emptyPaths(hintLevel);
const hintSnapshot = hintInput.map((path) => path.slice());
let hintedPaths = hintInput;
let hintCalls = 0;
while (
  !isSolved(hintLevel, hintedPaths) &&
  hintCalls < hintLevel.pairs.length
) {
  hintedPaths = applyHint(hintLevel, hintedPaths);
  hintCalls += 1;
}
assert.strictEqual(isSolved(hintLevel, hintedPaths), true);
assert.strictEqual(hintCalls <= hintLevel.pairs.length, true);
assert.deepStrictEqual(hintInput, hintSnapshot);
