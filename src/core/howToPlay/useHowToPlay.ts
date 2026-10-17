import { useProgress } from "@/core/store/progress";
import { useEffect, useState } from "react";

export function useHowToPlay(id: string) {
  const [visible, setVisible] = useState(() => {
    const store = useProgress.getState();
    return useProgress.persist.hasHydrated() && store.seenHowTo[id] !== true;
  });

  useEffect(() => {
    const syncVisibility = (state = useProgress.getState()) => {
      setVisible(state.seenHowTo[id] !== true);
    };

    if (useProgress.persist.hasHydrated()) {
      syncVisibility();
      return;
    }

    return useProgress.persist.onFinishHydration(syncVisibility);
  }, [id]);

  const open = () => setVisible(true);
  const close = () => {
    setVisible(false);
    useProgress.getState().markHowToSeen(id);
  };

  return { visible, open, close };
}
