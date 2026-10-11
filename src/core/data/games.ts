import { colors, gradients } from "@/core/theme";

export type GameInfo = {
  id: string;
  title: string;
  emoji: string;
  route: string;
  gradient: readonly [string, string];
  ready: boolean;
};

export const games: GameInfo[] = [
  {
    id: "ticTacToe",
    title: "Tic Tac Toe",
    emoji: "❌",
    route: "/games/tic-tac-toe",
    gradient: gradients.warm,
    ready: true,
  },
  {
    id: "wordBuilder",
    title: "Word Builder",
    emoji: "✏️",
    route: "/games/word-builder",
    gradient: gradients.cool,
    ready: false,
  },
  {
    id: "quiz",
    title: "Brain Boost",
    emoji: "🧠",
    route: "/games/quiz",
    gradient: gradients.primary,
    ready: false,
  },
  {
    id: "slidingPuzzle",
    title: "Sliding Puzzle",
    emoji: "🧩",
    route: "/games/sliding-puzzle",
    gradient: gradients.gold,
    ready: false,
  },
  {
    id: "waterSort",
    title: "Water Sort",
    emoji: "🧪",
    route: "/games/water-sort",
    gradient: [colors.blue, colors.teal],
    ready: false,
  },
  {
    id: "freeFlow",
    title: "Free Flow",
    emoji: "🌊",
    route: "/games/free-flow",
    gradient: [colors.purple, colors.pink],
    ready: false,
  },
];
