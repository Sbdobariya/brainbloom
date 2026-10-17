import {
    createAudioPlayer,
    setAudioModeAsync,
    type AudioPlayer,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";

import { useSettings } from "@/core/store/settings";

export type SoundName =
  | "tap"
  | "pop"
  | "correct"
  | "wrong"
  | "win"
  | "lose"
  | "star";

const sources: Record<SoundName, number> = {
  tap: require("../../../assets/sounds/tap.wav"),
  pop: require("../../../assets/sounds/pop.wav"),
  correct: require("../../../assets/sounds/correct.wav"),
  wrong: require("../../../assets/sounds/wrong.wav"),
  win: require("../../../assets/sounds/win.wav"),
  lose: require("../../../assets/sounds/lose.wav"),
  star: require("../../../assets/sounds/star.wav"),
};

const players: Partial<Record<SoundName, AudioPlayer>> = {};
let audioModePromise: Promise<void> | undefined;

export function playSound(name: SoundName): void {
  try {
    if (!useSettings.getState().soundOn) {
      return;
    }
    void playSoundSafely(name);
  } catch {
    // Sound feedback must never interrupt gameplay.
  }
}

export function speak(text: string): void {
  try {
    if (!useSettings.getState().soundOn) {
      return;
    }

    void Speech.stop()
      .catch(() => undefined)
      .finally(() => {
        try {
          Speech.speak(text, { language: "en-US", rate: 0.8, pitch: 1.1 });
        } catch {
          // Speech feedback must never interrupt gameplay.
        }
      });
  } catch {
    // Speech feedback must never interrupt gameplay.
  }
}

export const haptic = {
  tap: () =>
    runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () =>
    runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  select: () => runHaptic(() => Haptics.selectionAsync()),
  success: () =>
    runHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    ),
  warning: () =>
    runHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    ),
};

async function playSoundSafely(name: SoundName): Promise<void> {
  try {
    audioModePromise ??= setAudioModeAsync({
      playsInSilentMode: false,
      interruptionMode: "mixWithOthers",
    });
    await audioModePromise;

    let player = players[name];
    if (player === undefined) {
      player = createAudioPlayer(sources[name]);
      players[name] = player;
    }

    await player.seekTo(0);
    player.play();
  } catch {
    // Ignore unavailable assets or device audio failures.
  }
}

function runHaptic(effect: () => Promise<void>): void {
  if (!useSettings.getState().hapticsOn) {
    return;
  }

  try {
    void effect().catch(() => undefined);
  } catch {
    // Haptics must never interrupt gameplay.
  }
}
