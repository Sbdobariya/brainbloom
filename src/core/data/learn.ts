import { gradients } from "@/core/theme";

export type LearnModule = {
  id: string;
  title: string;
  emoji: string;
  route: string;
  gradient: readonly [string, string];
  ready: boolean;
};

export const learnModules: LearnModule[] = [
  {
    id: "alphabet",
    title: "ABC",
    emoji: "🔤",
    route: "/learn/alphabet",
    gradient: gradients.cool,
    ready: true,
  },
  {
    id: "numbers",
    title: "123",
    emoji: "🔢",
    route: "/learn/numbers",
    gradient: gradients.warm,
    ready: true,
  },
  {
    id: "shapes",
    title: "Shapes",
    emoji: "🔷",
    route: "/learn/shapes",
    gradient: gradients.primary,
    ready: false,
  },
  {
    id: "findLetter",
    title: "Find the Letter",
    emoji: "🔎",
    route: "/learn/find-letter",
    gradient: gradients.gold,
    ready: true,
  },
];
