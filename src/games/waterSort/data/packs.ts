import type { Pack } from "@/core/components";
import { colors } from "@/core/theme";

export const WATER_SORT_LEVELS = 100;

export const waterSortPacks: Pack[] = [
  {
    id: "easy",
    title: "Easy",
    emoji: "🙂",
    color: colors.green,
    from: 1,
    count: 20,
    hint: "3 to 4 colors",
  },
  {
    id: "medium",
    title: "Medium",
    emoji: "⚡",
    color: colors.blue,
    from: 21,
    count: 20,
    hint: "5 colors",
  },
  {
    id: "hard",
    title: "Hard",
    emoji: "🔥",
    color: colors.orange,
    from: 41,
    count: 20,
    hint: "6 colors",
  },
  {
    id: "expert",
    title: "Expert",
    emoji: "💎",
    color: colors.purple,
    from: 61,
    count: 20,
    hint: "7 colors",
  },
  {
    id: "master",
    title: "Master",
    emoji: "👑",
    color: colors.red,
    from: 81,
    count: 20,
    hint: "8 colors · for grown-ups",
  },
];
