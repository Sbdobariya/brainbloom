import { useIsFocused } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useRef, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "@/core/theme";

type Props = {
  children: ReactNode;
};

export function AnimatedBackground({ children }: Props) {
  const isFocused = useIsFocused();
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (isFocused) {
      animationRef.current?.play();
    } else {
      animationRef.current?.pause();
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.background}>
        <LottieView
          ref={animationRef}
          source={require("../../../assets/lottie/home-bg.json")}
          autoPlay
          loop
          resizeMode="cover"
          style={styles.animation}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  background: {
    ...StyleSheet.absoluteFill,
  },
  animation: {
    ...StyleSheet.absoluteFill,
    opacity: 0.2,
  },
});
