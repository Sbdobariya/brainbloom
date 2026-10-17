import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "./storage";

type SettingsState = {
  soundOn: boolean;
  hapticsOn: boolean;
  setSoundOn: (soundOn: boolean) => void;
  setHapticsOn: (hapticsOn: boolean) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      soundOn: true,
      hapticsOn: true,
      setSoundOn: (soundOn) => set({ soundOn }),
      setHapticsOn: (hapticsOn) => set({ hapticsOn }),
    }),
    {
      name: "brainbloom-settings",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
