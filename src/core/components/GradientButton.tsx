import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text } from "react-native";

import {
  gradients,
  MIN_TOUCH,
  radius,
  colors as themeColors,
  typography,
} from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
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
  const { s } = useResponsive();
  const responsiveStyles = StyleSheet.create({
    button: {
      minHeight: Math.max(MIN_TOUCH, s(MIN_TOUCH)),
      borderRadius: s(radius.lg),
    },
    gradient: {
      minHeight: Math.max(MIN_TOUCH, s(MIN_TOUCH)),
      paddingHorizontal: s(MIN_TOUCH),
      borderRadius: s(radius.lg),
    },
    label: { fontSize: s(typography.heading.fontSize) },
  });

  return (
    <PressableScale
      disabled={disabled}
      onPress={onPress}
      sound
      style={[
        styles.button,
        responsiveStyles.button,
        disabled && styles.disabled,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, responsiveStyles.gradient]}
      >
        <Text
          style={[styles.label, responsiveStyles.label]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {label}
        </Text>
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typography.heading,
    color: themeColors.text,
    textAlign: "center",
  },
});
