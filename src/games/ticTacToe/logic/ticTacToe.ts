export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = Cell[];
export type Difficulty = "easy" | "hard";

const WIN_LINES: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function createBoard(): Board {
  return Array<Cell>(9).fill(null);
}

export function getWinner(
  board: Board,
): { winner: Player; line: [number, number, number] } | null {
  for (const line of WIN_LINES) {
    const [first, second, third] = line;
    const cell = board[first];
    if (cell !== null && cell === board[second] && cell === board[third]) {
      return { winner: cell, line };
    }
  }
  return null;
}

export function isDraw(board: Board): boolean {
  return getWinner(board) === null && board.every((cell) => cell !== null);
}

export function getEmptyCells(board: Board): number[] {
  return board.flatMap((cell, index) => (cell === null ? [index] : []));
}

export function applyMove(board: Board, index: number, player: Player): Board {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= board.length ||
    board[index] !== null
  ) {
    return board;
  }

  const nextBoard = board.slice();
  nextBoard[index] = player;
  return nextBoard;
}

export function getCpuMove(
  board: Board,
  cpu: Player,
  difficulty: Difficulty,
): number {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0 || getWinner(board) !== null) {
    return -1;
  }

  if (difficulty === "easy") {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  let bestMove = emptyCells[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const index of emptyCells) {
    const nextBoard = applyMove(board, index, cpu);
    const score = minimax(nextBoard, cpu, 1, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
}

function minimax(
  board: Board,
  cpu: Player,
  depth: number,
  maximizing: boolean,
): number {
  const result = getWinner(board);
  if (result !== null) {
    return result.winner === cpu ? 10 - depth : depth - 10;
  }

  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) {
    return 0;
  }

  const currentPlayer: Player = maximizing ? cpu : cpu === "X" ? "O" : "X";
  let bestScore = maximizing
    ? Number.NEGATIVE_INFINITY
    : Number.POSITIVE_INFINITY;

  for (const index of emptyCells) {
    const nextBoard = applyMove(board, index, currentPlayer);
    const score = minimax(nextBoard, cpu, depth + 1, !maximizing);
    bestScore = maximizing
      ? Math.max(bestScore, score)
      : Math.min(bestScore, score);
  }

  return bestScore;
}
