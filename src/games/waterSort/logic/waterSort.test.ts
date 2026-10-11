import assert from "node:assert";

import {
    canPour,
    CAPACITY,
    createLevel,
    getLevelConfig,
    isSolved,
    pour,
    solvedCount,
    topColor,
    topRunLength,
    type Tube,
} from "./waterSort";

for (const [level, colorCount] of [
  [1, 3],
  [3, 4],
  [5, 5],
  [9, 7],
] as const) {
  assert.deepStrictEqual(getLevelConfig(level), {
    colors: colorCount,
    empty: 2,
  });

  for (let run = 0; run < 100; run += 1) {
    const tubes = createLevel(level);
    assert.strictEqual(tubes.length, colorCount + 2);
    assert.strictEqual(tubes.filter((tube) => tube.length === 0).length, 2);
    assert.strictEqual(
      tubes.slice(0, colorCount).every((tube) => tube.length === CAPACITY),
      true,
    );
    assert.strictEqual(isSolved(tubes), false);

    const counts = new Map<number, number>();
    for (const tube of tubes) {
      for (const color of tube) {
        counts.set(color, (counts.get(color) ?? 0) + 1);
      }
    }
    assert.strictEqual(counts.size, colorCount);
    for (let color = 1; color <= colorCount; color += 1) {
      assert.strictEqual(counts.get(color), CAPACITY);
    }
  }
}

const pourRules: Tube[] = [[1, 2, 2], [2], [3], [], [4, 4, 4, 4]];
assert.strictEqual(canPour(pourRules, 0, 1), true);
assert.strictEqual(canPour(pourRules, 0, 3), true);
assert.strictEqual(canPour(pourRules, 0, 2), false);
assert.strictEqual(canPour(pourRules, 0, 4), false);
assert.strictEqual(canPour(pourRules, 0, 0), false);
assert.strictEqual(canPour(pourRules, 3, 1), false);
assert.strictEqual(canPour(pourRules, -1, 1), false);

const source: Tube = [1, 2, 2];
const target: Tube = [2];
const originalTubes = [source, target];
const pouredTubes = pour(originalTubes, 0, 1);
assert.notStrictEqual(pouredTubes, originalTubes);
assert.notStrictEqual(pouredTubes[0], source);
assert.notStrictEqual(pouredTubes[1], target);
assert.deepStrictEqual(originalTubes, [[1, 2, 2], [2]]);
assert.deepStrictEqual(pouredTubes, [[1], [2, 2, 2]]);

const limitedSpace: Tube[] = [
  [5, 5, 5],
  [6, 5, 5],
];
assert.strictEqual(canPour(limitedSpace, 0, 1), true);
assert.deepStrictEqual(pour(limitedSpace, 0, 1), [
  [5, 5],
  [6, 5, 5, 5],
]);
assert.strictEqual(pour(pourRules, 0, 2), pourRules);

const solvedTubes: Tube[] = [[1, 1, 1, 1], [], [2, 2, 2, 2]];
const unsolvedTubes: Tube[] = [[1, 1, 1, 1], [2, 2], [3, 3, 4, 4], []];
assert.strictEqual(isSolved(solvedTubes), true);
assert.strictEqual(solvedCount(solvedTubes), 2);
assert.strictEqual(isSolved(unsolvedTubes), false);
assert.strictEqual(solvedCount(unsolvedTubes), 1);
assert.strictEqual(topColor([]), null);
assert.strictEqual(topColor([1, 2, 2]), 2);
assert.strictEqual(topRunLength([1, 2, 2]), 2);
assert.strictEqual(topRunLength([]), 0);
