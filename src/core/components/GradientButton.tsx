import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text } from "react-native";

import {
  gradients,
  MIN_TOUCH,
  radius,
  colors as themeColors,
  typography,
} from "@/core/theme";
import { PressableScale } from "./PressableScale";

type Props = {
  label: string;
  onPress: () => void;
  colors?: readonly [string, string];
  disabled?: boolean;
};

export function GradientButton({
  label,
  onPress,
  colors = gradients.warm,
  disabled = false,
}: Props) {
  return (
    <PressableScale
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    flex: 1,
    minHeight: MIN_TOUCH,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: MIN_TOUCH,
    borderRadius: radius.lg,
  },
  label: {
    ...typography.heading,
    color: themeColors.text,
    textAlign: "center",
  },
});
