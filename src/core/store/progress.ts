import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { nextStreak, toDateKey, type Stars } from "@/core/logic/stars";
import { zustandStorage } from "./storage";

type ProgressState = {
  stars: Record<string, Stars>;
  plays: Record<string, number>;
  lastPlayed: string | null;
  streak: number;
  recordResult: (gameId: string, stars: Stars) => void;
  resetProgress: () => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      stars: {},
      plays: {},
      lastPlayed: null,
      streak: 0,
      recordResult: (gameId, earnedStars) => {
        const today = toDateKey(new Date());
        set((state) => {
          const currentStars = state.stars[gameId] ?? 0;
          const bestStars: Stars =
            earnedStars > currentStars ? earnedStars : currentStars;
          return {
            stars: { ...state.stars, [gameId]: bestStars },
            plays: { ...state.plays, [gameId]: (state.plays[gameId] ?? 0) + 1 },
            lastPlayed: today,
            streak: nextStreak(state.lastPlayed, today, state.streak),
          };
        });
      },
      resetProgress: () =>
        set({ stars: {}, plays: {}, lastPlayed: null, streak: 0 }),
    }),
    {
      name: "brainbloom-progress",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

export function selectTotalStars(state: Pick<ProgressState, "stars">): number {
  return Object.values(state.stars).reduce<number>(
    (total, stars) => total + stars,
    0,
  );
}
