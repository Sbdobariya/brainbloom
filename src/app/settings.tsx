import { playSound } from "@/core/audio/feedback";
import { GameScreen, ToggleSwitch } from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { PRIVACY_URL } from "@/core/config";
import { useGate } from "@/core/store/gate";
import { useProgress } from "@/core/store/progress";
import { useSettings } from "@/core/store/settings";
import { colors, MIN_TOUCH, radius, spacing, typography } from "@/core/theme";
import * as WebBrowser from "expo-web-browser";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function Settings() {
  const soundOn = useSettings((state) => state.soundOn);
  const hapticsOn = useSettings((state) => state.hapticsOn);
  const setSoundOn = useSettings((state) => state.setSoundOn);
  const setHapticsOn = useSettings((state) => state.setHapticsOn);

  return (
    <GameScreen title="Settings">
      <View style={styles.rows}>
        <View style={styles.row}>
          <Text style={styles.emoji}>🔊</Text>
          <Text style={styles.label}>Sound</Text>
          <ToggleSwitch
            value={soundOn}
            onChange={(enabled) => {
              setSoundOn(enabled);
              if (enabled) playSound("pop");
            }}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.emoji}>📳</Text>
          <Text style={styles.label}>Vibration</Text>
          <ToggleSwitch value={hapticsOn} onChange={setHapticsOn} />
        </View>
      </View>
      <Text style={styles.note}>
        BrainBloom stores your stars on this device only.
      </Text>
      <Text style={styles.sectionHeading}>🔒 For parents</Text>
      <View style={styles.rows}>
        <PressableScale
          style={styles.row}
          onPress={() =>
            useGate
              .getState()
              .request(() => WebBrowser.openBrowserAsync(PRIVACY_URL))
          }
        >
          <Text style={styles.emoji}>🔒</Text>
          <Text style={styles.label}>Privacy policy</Text>
        </PressableScale>
        <PressableScale
          style={styles.row}
          onPress={() =>
            useGate.getState().request(() =>
              Alert.alert(
                "Reset progress?",
                "This removes all stars and your streak on this device.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => useProgress.getState().resetProgress(),
                  },
                ],
              ),
            )
          }
        >
          <Text style={styles.emoji}>🗑️</Text>
          <Text style={styles.label}>Reset progress</Text>
        </PressableScale>
      </View>
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: spacing.md,
  },
  row: {
    minHeight: MIN_TOUCH,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  emoji: {
    ...typography.heading,
  },
  label: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  sectionHeading: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});
