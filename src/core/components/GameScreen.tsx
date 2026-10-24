import { router } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import { GameHeader } from "./GameHeader";

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
  onHelp?: () => void;
  scrollable?: boolean;
  children: ReactNode;
};

export function GameScreen({
  title,
  subtitle,
  right,
  onBack,
  onHelp,
  scrollable = true,
  children,
}: Props) {
  const { contentWidth, padding } = useResponsive();

  const content = (
    <View
      style={[
        styles.content,
        {
          maxWidth: contentWidth,
          width: "100%",
          alignSelf: "center",
          paddingHorizontal: padding,
        },
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { maxWidth: contentWidth }]}>
        <GameHeader
          title={title}
          subtitle={subtitle}
          onBack={onBack ?? (() => router.back())}
          right={right}
          onHelp={onHelp}
        />
      </View>
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    width: "100%",
    alignSelf: "center",
  },
  scrollContent: { flexGrow: 1 },
  content: {
    flexGrow: 1,
  },
});
