import { colors as themeColors } from "@/core/theme";

export type ColorId =
  | "red"
  | "blue"
  | "yellow"
  | "green"
  | "orange"
  | "purple"
  | "pink"
  | "brown";

export type ColorItem = {
  id: ColorId;
  name: string;
  hex: string;
  emoji: string;
  thing: string;
};

export const colorItems: ColorItem[] = [
  { id: "red", name: "Red", hex: themeColors.red, emoji: "🍎", thing: "apple" },
  {
    id: "blue",
    name: "Blue",
    hex: themeColors.blue,
    emoji: "🐳",
    thing: "whale",
  },
  {
    id: "yellow",
    name: "Yellow",
    hex: themeColors.yellow,
    emoji: "🍌",
    thing: "banana",
  },
  {
    id: "green",
    name: "Green",
    hex: themeColors.green,
    emoji: "🐸",
    thing: "frog",
  },
  {
    id: "orange",
    name: "Orange",
    hex: themeColors.orange,
    emoji: "🍊",
    thing: "orange",
  },
  {
    id: "purple",
    name: "Purple",
    hex: themeColors.purple,
    emoji: "🍇",
    thing: "grapes",
  },
  {
    id: "pink",
    name: "Pink",
    hex: themeColors.pink,
    emoji: "🐷",
    thing: "pig",
  },
  {
    id: "brown",
    name: "Brown",
    hex: themeColors.brown,
    emoji: "🐻",
    thing: "bear",
  },
];
