import assert from "node:assert";

import {
  applyMove,
  createBoard,
  getCpuMove,
  getEmptyCells,
  getWinner,
  isDraw,
  type Board,
  type Cell,
} from "./ticTacToe";

const winLines: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

for (const line of winLines) {
  const board = createBoard();
  for (const index of line) {
    board[index] = "X";
  }
  assert.deepStrictEqual(getWinner(board), { winner: "X", line });
}

const drawBoard: Board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
assert.strictEqual(isDraw(drawBoard), true);
assert.strictEqual(isDraw(createBoard()), false);
assert.strictEqual(
  isDraw(["X", "X", "X", "O", "O", null, null, null, null]),
  false,
);

const originalBoard = createBoard();
const movedBoard = applyMove(originalBoard, 4, "X");
assert.notStrictEqual(movedBoard, originalBoard);
assert.deepStrictEqual(originalBoard, Array<Cell>(9).fill(null));
assert.deepStrictEqual(movedBoard, [
  null,
  null,
  null,
  null,
  "X",
  null,
  null,
  null,
  null,
]);
assert.strictEqual(applyMove(movedBoard, 4, "O"), movedBoard);
assert.deepStrictEqual(getEmptyCells(movedBoard), [0, 1, 2, 3, 5, 6, 7, 8]);

const blockingBoard: Board = [
  "X",
  "X",
  null,
  "O",
  null,
  null,
  null,
  null,
  null,
];
assert.strictEqual(getCpuMove(blockingBoard, "O", "hard"), 2);

const winningBoard: Board = ["O", "O", null, "X", "X", null, null, null, null];
assert.strictEqual(getCpuMove(winningBoard, "O", "hard"), 2);
