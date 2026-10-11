import assert from "node:assert";

import {
    nextStreak,
    starsForMoves,
    starsForTicTacToe,
    starsFromRatio,
    toDateKey,
} from "./stars";

assert.strictEqual(starsFromRatio(1), 3);
assert.strictEqual(starsFromRatio(0.8), 3);
assert.strictEqual(starsFromRatio(0.79), 2);
assert.strictEqual(starsFromRatio(0.5), 2);
assert.strictEqual(starsFromRatio(0.49), 1);
assert.strictEqual(starsFromRatio(0), 1);

assert.strictEqual(starsForTicTacToe("win", "hard"), 3);
assert.strictEqual(starsForTicTacToe("win", "easy"), 2);
assert.strictEqual(starsForTicTacToe("draw", "hard"), 2);
assert.strictEqual(starsForTicTacToe("draw", "easy"), 1);
assert.strictEqual(starsForTicTacToe("lose", "hard"), 1);
assert.strictEqual(starsForTicTacToe("lose", "easy"), 1);

assert.strictEqual(starsForMoves(10, 10, 20), 3);
assert.strictEqual(starsForMoves(11, 10, 20), 2);
assert.strictEqual(starsForMoves(20, 10, 20), 2);
assert.strictEqual(starsForMoves(21, 10, 20), 1);

assert.strictEqual(nextStreak(null, "2024-01-31", 7), 1);
assert.strictEqual(nextStreak("2024-01-31", "2024-01-31", 7), 7);
assert.strictEqual(nextStreak("2024-01-31", "2024-02-01", 7), 8);
assert.strictEqual(nextStreak("2024-02-01", "2024-02-03", 7), 1);
assert.strictEqual(nextStreak("2024-02-02", "2024-02-01", 7), 1);

assert.strictEqual(toDateKey(new Date(2024, 0, 2, 12, 0, 0)), "2024-01-02");
