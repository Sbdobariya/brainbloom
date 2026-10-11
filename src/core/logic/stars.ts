export type Stars = 0 | 1 | 2 | 3;

export function starsFromRatio(ratio: number): Stars {
  if (ratio >= 0.8) {
    return 3;
  }
  if (ratio >= 0.5) {
    return 2;
  }
  return 1;
}

export function starsForTicTacToe(
  result: "win" | "draw" | "lose",
  difficulty: "easy" | "hard",
): Stars {
  if (result === "win") {
    return difficulty === "hard" ? 3 : 2;
  }
  if (result === "draw") {
    return difficulty === "hard" ? 2 : 1;
  }
  return 1;
}

export function starsForMoves(
  moves: number,
  threeStarMax: number,
  twoStarMax: number,
): Stars {
  if (moves <= threeStarMax) {
    return 3;
  }
  if (moves <= twoStarMax) {
    return 2;
  }
  return 1;
}

export function nextStreak(
  lastPlayed: string | null,
  today: string,
  streak: number,
): number {
  if (lastPlayed === null) {
    return 1;
  }
  if (lastPlayed === today) {
    return streak;
  }

  const lastTimestamp = Date.parse(`${lastPlayed}T00:00:00.000Z`);
  const todayTimestamp = Date.parse(`${today}T00:00:00.000Z`);
  return todayTimestamp - lastTimestamp === 86_400_000 ? streak + 1 : 1;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
