import { gradients } from "@/core/theme";

export type LearnModule = {
  id: string;
  title: string;
  emoji: string;
  category: string;
  subtitle: string;
  route: string;
  gradient: readonly [string, string];
  ready: boolean;
};

export const learnModules: LearnModule[] = [
  {
    id: "alphabet",
    title: "ABC",
    emoji: "🔤",
    category: "PHONICS",
    subtitle: "Spot the alphabet",
    route: "/learn/alphabet",
    gradient: gradients.cool,
    ready: true,
  },
  {
    id: "numbers",
    title: "123",
    emoji: "🔢",
    category: "NUMBERS",
    subtitle: "Count the objects",
    route: "/learn/numbers",
    gradient: gradients.warm,
    ready: true,
  },
  {
    id: "shapes",
    title: "Shapes",
    emoji: "🔷",
    category: "SHAPES",
    subtitle: "Meet shapes",
    route: "/learn/shapes",
    gradient: gradients.primary,
    ready: true,
  },
  {
    id: "findLetter",
    title: "Find the Letter",
    emoji: "🔎",
    category: "LETTERS",
    subtitle: "Listen and find",
    route: "/learn/find-letter",
    gradient: gradients.gold,
    ready: true,
  },
  {
    id: "howMany",
    title: "How Many?",
    emoji: "🧮",
    category: "COUNTING",
    subtitle: "Count and tap",
    route: "/learn/how-many",
    gradient: gradients.primary,
    ready: true,
  },
  {
    id: "findShape",
    title: "Name the Shape",
    emoji: "🔶",
    category: "SHAPES",
    subtitle: "Look and name it",
    route: "/learn/find-shape",
    gradient: gradients.warm,
    ready: true,
  },
  {
    id: "colors",
    title: "Colors",
    emoji: "🌈",
    category: "COLORS",
    subtitle: "Learn each color",
    route: "/learn/colors",
    gradient: gradients.primary,
    ready: true,
  },
  {
    id: "findColor",
    title: "Name the Color",
    emoji: "🖍️",
    category: "COLORS",
    subtitle: "Look and name it",
    route: "/learn/find-color",
    gradient: gradients.cool,
    ready: true,
  },
];
