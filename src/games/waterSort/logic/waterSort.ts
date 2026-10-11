export const CAPACITY = 4;

export type Tube = number[];

export function getLevelConfig(level: number): {
  colors: number;
  empty: number;
} {
  const colors =
    level <= 2 ? 3 : level <= 4 ? 4 : level <= 6 ? 5 : level <= 8 ? 6 : 7;
  return { colors: Math.min(colors, 8), empty: 2 };
}

export function createLevel(level: number): Tube[] {
  const { colors } = getLevelConfig(level);
  const colorPool = Array.from(
    { length: colors * CAPACITY },
    (_, index) => Math.floor(index / CAPACITY) + 1,
  );

  let tubes: Tube[];
  do {
    const shuffled = shuffle(colorPool);
    tubes = Array.from({ length: colors }, (_, index) =>
      shuffled.slice(index * CAPACITY, (index + 1) * CAPACITY),
    );
    tubes.push(...Array.from({ length: 2 }, () => []));
  } while (isSolved(tubes) || tubes.slice(0, colors).some(isMonochromeFull));

  return tubes;
}

export function topColor(tube: Tube): number | null {
  return tube.length === 0 ? null : tube[tube.length - 1];
}

export function topRunLength(tube: Tube): number {
  const color = topColor(tube);
  if (color === null) {
    return 0;
  }

  let count = 0;
  for (
    let index = tube.length - 1;
    index >= 0 && tube[index] === color;
    index -= 1
  ) {
    count += 1;
  }
  return count;
}

export function canPour(tubes: Tube[], from: number, to: number): boolean {
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    from >= tubes.length ||
    to < 0 ||
    to >= tubes.length ||
    from === to
  ) {
    return false;
  }

  const source = tubes[from];
  const target = tubes[to];
  if (source.length === 0 || target.length >= CAPACITY) {
    return false;
  }

  const sourceColor = topColor(source);
  const targetColor = topColor(target);
  return targetColor === null || targetColor === sourceColor;
}

export function pour(tubes: Tube[], from: number, to: number): Tube[] {
  if (!canPour(tubes, from, to)) {
    return tubes;
  }

  const nextTubes = tubes.map((tube) => tube.slice());
  const source = nextTubes[from];
  const target = nextTubes[to];
  const color = topColor(source);
  const unitsToMove = Math.min(topRunLength(source), CAPACITY - target.length);

  for (let unit = 0; unit < unitsToMove; unit += 1) {
    source.pop();
    target.push(color as number);
  }

  return nextTubes;
}

export function isSolved(tubes: Tube[]): boolean {
  return tubes.every((tube) => tube.length === 0 || isMonochromeFull(tube));
}

export function solvedCount(tubes: Tube[]): number {
  return tubes.filter(isMonochromeFull).length;
}

function isMonochromeFull(tube: Tube): boolean {
  return tube.length === CAPACITY && tube.every((color) => color === tube[0]);
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = items.slice();
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}
