import assert from "node:assert";

import {
    canMove,
    createSolved,
    getHint,
    isSolved,
    moveTile,
    shuffleBoard,
    type Board,
} from "./slidingPuzzle";

assert.deepStrictEqual(createSolved(3), [1, 2, 3, 4, 5, 6, 7, 8, 0]);
assert.deepStrictEqual(
  createSolved(4),
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0],
);
assert.strictEqual(isSolved(createSolved(3)), true);

const edgeBoard: Board = [1, 2, 3, 0, 4, 5, 6, 7, 8];
assert.strictEqual(canMove(edgeBoard, 3, 2), false);
assert.strictEqual(canMove(edgeBoard, 3, 4), true);
assert.strictEqual(canMove(edgeBoard, 3, 0), true);
assert.strictEqual(canMove(edgeBoard, 3, 6), true);
assert.strictEqual(canMove(edgeBoard, 3, 5), false);

const solvedBoard = createSolved(3);
const movedBoard = moveTile(solvedBoard, 3, 7);
assert.notStrictEqual(movedBoard, solvedBoard);
assert.deepStrictEqual(solvedBoard, [1, 2, 3, 4, 5, 6, 7, 8, 0]);
assert.deepStrictEqual(movedBoard, [1, 2, 3, 4, 5, 6, 7, 0, 8]);
assert.strictEqual(moveTile(solvedBoard, 3, 6), solvedBoard);

for (const size of [3, 4]) {
  for (let run = 0; run < 100; run += 1) {
    const board = shuffleBoard(size);
    const expectedTiles = Array.from(
      { length: size * size },
      (_, index) => index,
    );
    assert.strictEqual(isSolved(board), false);
    assert.deepStrictEqual(
      board.slice().sort((first, second) => first - second),
      expectedTiles,
    );

    const inversionCount = board
      .filter((tile) => tile !== 0)
      .reduce((count, tile, index, tiles) => {
        for (
          let nextIndex = index + 1;
          nextIndex < tiles.length;
          nextIndex += 1
        ) {
          if (tile > tiles[nextIndex]) {
            count += 1;
          }
        }
        return count;
      }, 0);
    const isSolvable =
      size % 2 === 1
        ? inversionCount % 2 === 0
        : (inversionCount + size - Math.floor(board.indexOf(0) / size)) % 2 ===
          1;
    assert.strictEqual(isSolvable, true);

    const hint = getHint(board, size, null);
    assert.strictEqual(canMove(board, size, hint), true);
  }
}
