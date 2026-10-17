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
    ready: true,
  },
  {
    id: "findLetter",
    title: "Find the Letter",
    emoji: "🔎",
    route: "/learn/find-letter",
    gradient: gradients.gold,
    ready: true,
  },
  {
    id: "howMany",
    title: "How Many?",
    emoji: "🧮",
    route: "/learn/how-many",
    gradient: gradients.primary,
    ready: true,
  },
  {
    id: "findShape",
    title: "Name the Shape",
    emoji: "🔶",
    route: "/learn/find-shape",
    gradient: gradients.warm,
    ready: true,
  },
  {
    id: "colors",
    title: "Colors",
    emoji: "🌈",
    route: "/learn/colors",
    gradient: gradients.primary,
    ready: true,
  },
  {
    id: "findColor",
    title: "Name the Color",
    emoji: "🖍️",
    route: "/learn/find-color",
    gradient: gradients.cool,
    ready: true,
  },
];
