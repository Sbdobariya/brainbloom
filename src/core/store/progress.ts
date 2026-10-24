import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { nextStreak, toDateKey, type Stars } from "@/core/logic/stars";
import { zustandStorage } from "./storage";

type ProgressState = {
  stars: Record<string, Stars>;
  plays: Record<string, number>;
  lastPlayed: string | null;
  streak: number;
  seenHowTo: Record<string, boolean>;
  levelStars: Record<string, Record<number, Stars>>;
  unlocked: Record<string, number>;
  recordResult: (gameId: string, stars: Stars) => void;
  recordLevel: (gameId: string, level: number, stars: Stars) => void;
  skipLevel: (gameId: string, level: number) => void;
  markHowToSeen: (id: string) => void;
  resetSeenHowTo: () => void;
  resetProgress: () => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      stars: {},
      plays: {},
      lastPlayed: null,
      streak: 0,
      seenHowTo: {},
      levelStars: {},
      unlocked: {},
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
      recordLevel: (gameId, level, earnedStars) =>
        set((state) => {
          const gameLevelStars = { ...(state.levelStars[gameId] ?? {}) };
          const currentStars = gameLevelStars[level] ?? 0;
          gameLevelStars[level] =
            earnedStars > currentStars ? earnedStars : currentStars;

          return {
            levelStars: { ...state.levelStars, [gameId]: gameLevelStars },
            unlocked: {
              ...state.unlocked,
              [gameId]: Math.max(state.unlocked[gameId] ?? 1, level + 1),
            },
          };
        }),
      skipLevel: (gameId, level) =>
        set((state) => ({
          unlocked: {
            ...state.unlocked,
            [gameId]: Math.max(state.unlocked[gameId] ?? 1, level + 1),
          },
        })),
      markHowToSeen: (id) =>
        set((state) => ({
          seenHowTo: { ...state.seenHowTo, [id]: true },
        })),
      resetSeenHowTo: () => set({ seenHowTo: {} }),
      resetProgress: () =>
        set({
          stars: {},
          plays: {},
          lastPlayed: null,
          streak: 0,
          levelStars: {},
          unlocked: {},
        }),
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
