import { playSound } from "@/core/audio/feedback";
import { GameScreen, ToggleSwitch } from "@/core/components";
import { PressableScale } from "@/core/components/PressableScale";
import { PRIVACY_URL } from "@/core/config";
import { useGate } from "@/core/store/gate";
import { useProgress } from "@/core/store/progress";
import { useSettings } from "@/core/store/settings";
import { colors, MIN_TOUCH, radius, spacing, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import * as WebBrowser from "expo-web-browser";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function Settings() {
  const { s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    rows: { gap: s(spacing.md) },
    row: {
      minHeight: Math.max(MIN_TOUCH, s(MIN_TOUCH)),
      gap: s(spacing.md),
      padding: s(spacing.md),
      borderRadius: s(radius.lg),
    },
    emoji: { fontSize: s(typography.heading.fontSize) },
    label: { fontSize: s(typography.body.fontSize) },
    note: {
      marginTop: s(spacing.lg),
      fontSize: s(typography.caption.fontSize),
    },
    sectionHeading: {
      marginTop: s(spacing.xl),
      marginBottom: s(spacing.md),
      fontSize: s(typography.heading.fontSize),
    },
  });
  const soundOn = useSettings((state) => state.soundOn);
  const hapticsOn = useSettings((state) => state.hapticsOn);
  const setSoundOn = useSettings((state) => state.setSoundOn);
  const setHapticsOn = useSettings((state) => state.setHapticsOn);

  return (
    <GameScreen title="Settings">
      <View style={[styles.rows, responsiveStyles.rows]}>
        <View style={[styles.row, responsiveStyles.row]}>
          <Text style={[styles.emoji, responsiveStyles.emoji]}>🔊</Text>
          <Text
            style={[styles.label, responsiveStyles.label]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Sound
          </Text>
          <ToggleSwitch
            value={soundOn}
            onChange={(enabled) => {
              setSoundOn(enabled);
              if (enabled) playSound("pop");
            }}
          />
        </View>
        <View style={[styles.row, responsiveStyles.row]}>
          <Text style={[styles.emoji, responsiveStyles.emoji]}>📳</Text>
          <Text
            style={[styles.label, responsiveStyles.label]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Vibration
          </Text>
          <ToggleSwitch value={hapticsOn} onChange={setHapticsOn} />
        </View>
      </View>
      <Text style={[styles.note, responsiveStyles.note]}>
        BrainBloom stores your stars on this device only.
      </Text>
      <Text
        style={[styles.sectionHeading, responsiveStyles.sectionHeading]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        🔒 For parents
      </Text>
      <View style={[styles.rows, responsiveStyles.rows]}>
        <PressableScale
          style={[styles.row, responsiveStyles.row]}
          onPress={() =>
            useGate
              .getState()
              .request(() => WebBrowser.openBrowserAsync(PRIVACY_URL))
          }
        >
          <Text style={[styles.emoji, responsiveStyles.emoji]}>🔒</Text>
          <Text
            style={[styles.label, responsiveStyles.label]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Privacy policy
          </Text>
        </PressableScale>
        <PressableScale
          style={[styles.row, responsiveStyles.row]}
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
          <Text style={[styles.emoji, responsiveStyles.emoji]}>🗑️</Text>
          <Text
            style={[styles.label, responsiveStyles.label]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Reset progress
          </Text>
        </PressableScale>
      </View>
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  rows: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  emoji: { ...typography.heading },
  label: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  sectionHeading: {
    ...typography.heading,
    color: colors.text,
  },
});
