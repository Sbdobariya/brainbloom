import { playSound } from "@/core/audio/feedback";
import { GameScreen, ToggleSwitch } from "@/core/components";
import { useSettings } from "@/core/store/settings";
import { colors, MIN_TOUCH, radius, spacing, typography } from "@/core/theme";
import { StyleSheet, Text, View } from "react-native";

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
});
