import { create } from "zustand";

type GateState = {
  visible: boolean;
  onPass: (() => void) | null;
  request: (onPass: () => void) => void;
  close: () => void;
};

export const useGate = create<GateState>()((set) => ({
  visible: false,
  onPass: null,
  request: (onPass) => set({ visible: true, onPass }),
  close: () => set({ visible: false, onPass: null }),
}));
