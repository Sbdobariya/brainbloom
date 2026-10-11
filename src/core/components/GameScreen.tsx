import { router } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "@/core/theme";
import { GameHeader } from "./GameHeader";

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
};

export function GameScreen({ title, subtitle, right, children }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <GameHeader
        title={title}
        subtitle={subtitle}
        onBack={() => router.back()}
        right={right}
      />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
