import { colors, gradients } from "@/core/theme";

export type GameInfo = {
  id: string;
  title: string;
  emoji: string;
  icon?: "flow";
  category: string;
  subtitle: string;
  route: string;
  gradient: readonly [string, string];
  ready: boolean;
};

export const games: GameInfo[] = [
  {
    id: "ticTacToe",
    title: "Tic Tac Toe",
    emoji: "❌",
    category: "2 PLAYERS",
    subtitle: "X & O vs a friend",
    route: "/games/tic-tac-toe",
    gradient: gradients.warm,
    ready: true,
  },
  {
    id: "wordBuilder",
    title: "Word Builder",
    emoji: "✏️",
    category: "SPELLING",
    subtitle: "Connect letters",
    route: "/games/word-builder",
    gradient: gradients.cool,
    ready: true,
  },
  {
    id: "quiz",
    title: "Brain Boost",
    emoji: "🧠",
    category: "TRIVIA",
    subtitle: "Think fast",
    route: "/games/quiz",
    gradient: gradients.primary,
    ready: true,
  },
  {
    id: "slidingPuzzle",
    title: "Sliding Puzzle",
    emoji: "🧩",
    category: "PUZZLE",
    subtitle: "Slide into place",
    route: "/games/sliding-puzzle",
    gradient: gradients.gold,
    ready: true,
  },
  {
    id: "waterSort",
    title: "Water Sort",
    emoji: "🧪",
    category: "COLORS",
    subtitle: "Sort the liquids",
    route: "/games/water-sort",
    gradient: [colors.blue, colors.teal],
    ready: true,
  },
  {
    id: "freeFlow",
    title: "Free Flow",
    emoji: "🌊",
    icon: "flow",
    category: "LOGIC",
    subtitle: "Connect the colors",
    route: "/games/free-flow",
    gradient: [colors.purple, colors.pink],
    ready: true,
  },
];
