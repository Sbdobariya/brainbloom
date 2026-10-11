export type Board = number[];

export function createSolved(size: number): Board {
  validateSize(size);
  return Array.from({ length: size * size }, (_, index) =>
    index === size * size - 1 ? 0 : index + 1,
  );
}

export function isSolved(board: Board): boolean {
  return board.every((tile, index) =>
    index === board.length - 1 ? tile === 0 : tile === index + 1,
  );
}

export function canMove(board: Board, size: number, index: number): boolean {
  if (
    !Number.isInteger(size) ||
    size < 1 ||
    board.length !== size * size ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= board.length ||
    board[index] === 0
  ) {
    return false;
  }

  const emptyIndex = board.indexOf(0);
  return getNeighbors(emptyIndex, size).includes(index);
}

export function moveTile(board: Board, size: number, index: number): Board {
  if (!canMove(board, size, index)) {
    return board;
  }

  const nextBoard = board.slice();
  const emptyIndex = nextBoard.indexOf(0);
  [nextBoard[emptyIndex], nextBoard[index]] = [
    nextBoard[index],
    nextBoard[emptyIndex],
  ];
  return nextBoard;
}

export function shuffleBoard(size: number): Board {
  if (!Number.isInteger(size) || size < 2) {
    throw new RangeError("size must be an integer of at least 2");
  }

  let board = createSolved(size);
  let previousEmptyIndex: number | null = null;
  const moveCount = size === 3 ? 80 : size === 4 ? 160 : size * size * 10;

  for (let move = 0; move < moveCount; move += 1) {
    const emptyIndex = board.indexOf(0);
    const candidates = getNeighbors(emptyIndex, size).filter(
      (index) => index !== previousEmptyIndex,
    );
    const index = candidates[Math.floor(Math.random() * candidates.length)];
    board = moveTile(board, size, index);
    previousEmptyIndex = emptyIndex;
  }

  if (isSolved(board)) {
    const emptyIndex = board.indexOf(0);
    const index = getNeighbors(emptyIndex, size).find(
      (candidate) => candidate !== previousEmptyIndex,
    );
    if (index !== undefined) {
      board = moveTile(board, size, index);
    }
  }

  return board;
}

export function getHint(
  board: Board,
  size: number,
  lastMoved: number | null,
): number {
  const emptyIndex = board.indexOf(0);
  const legalMoves = getNeighbors(emptyIndex, size).filter(
    (index) => board[index] !== 0,
  );
  if (legalMoves.length === 0) {
    return -1;
  }

  const alternatives =
    lastMoved === null
      ? legalMoves
      : legalMoves.filter((index) => board[index] !== lastMoved);
  const candidates = alternatives.length > 0 ? alternatives : legalMoves;

  let bestIndex = candidates[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const index of candidates) {
    const distance = manhattan(moveTile(board, size, index), size);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  return bestIndex;
}

export function manhattan(board: Board, size: number): number {
  let distance = 0;
  for (let index = 0; index < board.length; index += 1) {
    const tile = board[index];
    if (tile === 0) {
      continue;
    }

    const targetIndex = tile - 1;
    distance +=
      Math.abs(Math.floor(index / size) - Math.floor(targetIndex / size)) +
      Math.abs((index % size) - (targetIndex % size));
  }
  return distance;
}

function getNeighbors(index: number, size: number): number[] {
  if (index < 0 || size < 1) {
    return [];
  }

  const row = Math.floor(index / size);
  const column = index % size;
  const neighbors: number[] = [];

  if (row > 0) neighbors.push(index - size);
  if (row < size - 1) neighbors.push(index + size);
  if (column > 0) neighbors.push(index - 1);
  if (column < size - 1) neighbors.push(index + 1);

  return neighbors;
}

function validateSize(size: number): void {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("size must be a positive integer");
  }
}
