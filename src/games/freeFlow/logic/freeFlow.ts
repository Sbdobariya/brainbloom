export type Level = {
  size: number;
  pairs: { a: number; b: number }[];
  solution: number[][];
};

export type Paths = number[][];

export function createLevel(levelNumber: number): Level {
  const size = levelNumber <= 3 ? 5 : levelNumber <= 6 ? 6 : 7;
  const pairCount = size;
  const random = mulberry32(levelNumber);
  const fullPath = createHamiltonianPath(size, random);
  const solution: number[][] = [];
  let offset = 0;
  let cellsRemaining = fullPath.length;

  for (let pair = 0; pair < pairCount; pair += 1) {
    const pairsRemaining = pairCount - pair - 1;
    const maxLength = cellsRemaining - pairsRemaining * 3;
    const length =
      pairsRemaining === 0 ? cellsRemaining : randomInt(random, 3, maxLength);
    solution.push(fullPath.slice(offset, offset + length));
    offset += length;
    cellsRemaining -= length;
  }

  const pairs = solution.map((segment) => ({
    a: segment[0],
    b: segment[segment.length - 1],
  }));

  return { size, pairs, solution };
}

export function emptyPaths(level: Level): Paths {
  return level.pairs.map(() => []);
}

export function startPath(
  level: Level,
  paths: Paths,
  cell: number,
): { paths: Paths; color: number } | null {
  const color = level.pairs.findIndex(({ a, b }) => cell === a || cell === b);
  if (color !== -1) {
    const nextPaths = clonePaths(paths);
    nextPaths[color] = [cell];
    return { paths: nextPaths, color };
  }

  for (let pathColor = 0; pathColor < paths.length; pathColor += 1) {
    const pathIndex = paths[pathColor].indexOf(cell);
    if (pathIndex !== -1) {
      const nextPaths = clonePaths(paths);
      nextPaths[pathColor] = paths[pathColor].slice(0, pathIndex + 1);
      return { paths: nextPaths, color: pathColor };
    }
  }

  return null;
}

export function dragTo(
  level: Level,
  paths: Paths,
  color: number,
  cell: number,
): Paths {
  const area = level.size * level.size;
  if (
    !Number.isInteger(color) ||
    color < 0 ||
    color >= level.pairs.length ||
    !Number.isInteger(cell) ||
    cell < 0 ||
    cell >= area ||
    paths[color]?.length === 0
  ) {
    return paths;
  }

  let nextPaths = paths;
  const start = paths[color][paths[color].length - 1];
  const startRow = Math.floor(start / level.size);
  const targetRow = Math.floor(cell / level.size);
  const targetColumn = cell % level.size;
  let row = startRow;
  let column = start % level.size;

  while (row !== targetRow) {
    row += row < targetRow ? 1 : -1;
    const steppedPaths = applyStep(
      level,
      nextPaths,
      color,
      row * level.size + column,
    );
    if (steppedPaths === null) {
      return nextPaths;
    }
    nextPaths = steppedPaths;
  }

  while (column !== targetColumn) {
    column += column < targetColumn ? 1 : -1;
    const steppedPaths = applyStep(
      level,
      nextPaths,
      color,
      row * level.size + column,
    );
    if (steppedPaths === null) {
      return nextPaths;
    }
    nextPaths = steppedPaths;
  }

  return nextPaths;
}

export function isPairConnected(
  level: Level,
  paths: Paths,
  color: number,
): boolean {
  const pair = level.pairs[color];
  const path = paths[color];
  if (pair === undefined || path === undefined || path.length === 0) {
    return false;
  }

  return (
    (path[0] === pair.a && path[path.length - 1] === pair.b) ||
    (path[0] === pair.b && path[path.length - 1] === pair.a)
  );
}

export function coverage(level: Level, paths: Paths): number {
  const covered = new Set<number>();
  for (const path of paths) {
    for (const cell of path) {
      if (cell >= 0 && cell < level.size * level.size) {
        covered.add(cell);
      }
    }
  }
  return covered.size / (level.size * level.size);
}

export function isSolved(level: Level, paths: Paths): boolean {
  return (
    level.pairs.every((_, color) => isPairConnected(level, paths, color)) &&
    coverage(level, paths) === 1
  );
}

export function applyHint(level: Level, paths: Paths): Paths {
  let color = level.pairs.findIndex(
    (_, index) => !isPairConnected(level, paths, index),
  );
  if (color === -1) {
    color = level.solution.findIndex(
      (solution, index) => !samePath(paths[index] ?? [], solution),
    );
  }
  if (color === -1) {
    return paths;
  }

  const solution = level.solution[color];
  const solutionCells = new Set(solution);
  const nextPaths = clonePaths(paths);
  nextPaths[color] = solution.slice();

  for (let otherColor = 0; otherColor < nextPaths.length; otherColor += 1) {
    if (otherColor === color) {
      continue;
    }
    const overlapIndex = nextPaths[otherColor].findIndex((cell) =>
      solutionCells.has(cell),
    );
    if (overlapIndex !== -1) {
      nextPaths[otherColor] = nextPaths[otherColor].slice(0, overlapIndex);
    }
  }

  return nextPaths;
}

function applyStep(
  level: Level,
  paths: Paths,
  color: number,
  cell: number,
): Paths | null {
  const pair = level.pairs[color];
  const path = paths[color];
  const last = path[path.length - 1];
  const earlierIndex = path.indexOf(cell);

  if (isPathComplete(pair, path)) {
    if (earlierIndex !== -1 && earlierIndex < path.length - 1) {
      const nextPaths = clonePaths(paths);
      nextPaths[color] = path.slice(0, earlierIndex + 1);
      return nextPaths;
    }
    return null;
  }

  if (earlierIndex !== -1) {
    if (earlierIndex === path.length - 1) {
      return paths;
    }
    const nextPaths = clonePaths(paths);
    nextPaths[color] = path.slice(0, earlierIndex + 1);
    return nextPaths;
  }

  if (
    level.pairs.some(
      (otherPair, otherColor) =>
        otherColor !== color && (cell === otherPair.a || cell === otherPair.b),
    )
  ) {
    return null;
  }

  const otherEndpoint = path[0] === pair.a ? pair.b : pair.a;
  if (cell !== otherEndpoint && (cell === pair.a || cell === pair.b)) {
    return null;
  }

  const nextPaths = clonePaths(paths);
  const occupiedColor = nextPaths.findIndex(
    (otherPath, otherColor) => otherColor !== color && otherPath.includes(cell),
  );
  if (occupiedColor !== -1) {
    const occupiedIndex = nextPaths[occupiedColor].indexOf(cell);
    nextPaths[occupiedColor] = nextPaths[occupiedColor].slice(0, occupiedIndex);
  }
  nextPaths[color] = [...path, cell];
  return nextPaths;
}

function isPathComplete(pair: Level["pairs"][number], path: number[]): boolean {
  if (path.length === 0) {
    return false;
  }
  return (
    (path[0] === pair.a && path[path.length - 1] === pair.b) ||
    (path[0] === pair.b && path[path.length - 1] === pair.a)
  );
}

function clonePaths(paths: Paths): Paths {
  return paths.map((path) => path.slice());
}

function samePath(first: number[], second: number[]): boolean {
  return (
    first.length === second.length &&
    first.every((cell, index) => cell === second[index])
  );
}

function createHamiltonianPath(size: number, random: () => number): number[] {
  const cellCount = size * size;
  const neighbors = Array.from({ length: cellCount }, (_, cell) =>
    getNeighbors(size, cell),
  );

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const visited = new Uint8Array(cellCount);
    const path = [randomInt(random, 0, cellCount - 1)];
    let visitedNodes = 0;
    visited[path[0]] = 1;

    const search = (cell: number): boolean => {
      if (path.length === cellCount) {
        return true;
      }
      visitedNodes += 1;
      if (visitedNodes > 20_000) {
        return false;
      }

      const candidates = neighbors[cell]
        .filter((neighbor) => visited[neighbor] === 0)
        .map((neighbor) => ({
          cell: neighbor,
          degree: neighbors[neighbor].filter((next) => visited[next] === 0)
            .length,
          tieBreak: random(),
        }))
        .sort(
          (first, second) =>
            first.degree - second.degree || first.tieBreak - second.tieBreak,
        );

      for (const candidate of candidates) {
        visited[candidate.cell] = 1;
        path.push(candidate.cell);
        if (search(candidate.cell)) {
          return true;
        }
        path.pop();
        visited[candidate.cell] = 0;
      }

      return false;
    };

    if (search(path[0])) {
      return path;
    }
  }

  return Array.from({ length: cellCount }, (_, index) => {
    const row = Math.floor(index / size);
    const column = index % size;
    return row % 2 === 0 ? row * size + column : row * size + size - column - 1;
  });
}

function getNeighbors(size: number, cell: number): number[] {
  const row = Math.floor(cell / size);
  const column = cell % size;
  const neighbors: number[] = [];
  if (row > 0) neighbors.push(cell - size);
  if (row < size - 1) neighbors.push(cell + size);
  if (column > 0) neighbors.push(cell - 1);
  if (column < size - 1) neighbors.push(cell + 1);
  return neighbors;
}

function randomInt(
  random: () => number,
  minimum: number,
  maximum: number,
): number {
  return Math.floor(random() * (maximum - minimum + 1)) + minimum;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    let value = (state += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
