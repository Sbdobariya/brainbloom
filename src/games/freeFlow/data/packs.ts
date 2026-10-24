import type { Pack } from "@/core/components";
import { colors } from "@/core/theme";

export const FREE_FLOW_LEVELS = 150;

export const freeFlowPacks: Pack[] = [
  {
    id: "starter",
    title: "Starter",
    emoji: "🌱",
    color: colors.green,
    from: 1,
    count: 30,
    hint: "5×5 boards",
  },
  {
    id: "explorer",
    title: "Explorer",
    emoji: "🧭",
    color: colors.blue,
    from: 31,
    count: 30,
    hint: "6×6 boards",
  },
  {
    id: "adventurer",
    title: "Adventurer",
    emoji: "🚀",
    color: colors.purple,
    from: 61,
    count: 30,
    hint: "7×7 boards",
  },
  {
    id: "champion",
    title: "Champion",
    emoji: "🏆",
    color: colors.orange,
    from: 91,
    count: 30,
    hint: "8×8 boards",
  },
  {
    id: "master",
    title: "Master",
    emoji: "👑",
    color: colors.red,
    from: 121,
    count: 30,
    hint: "Bigger boards · for grown-ups",
  },
];
