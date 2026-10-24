import { haptic, playSound } from "@/core/audio/feedback";
import { colors, typography } from "@/core/theme";
import { useResponsive } from "@/core/theme/responsive";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "./PressableScale";

const TABS: Record<string, { emoji: string; label: string; color: string }> = {
  index: { emoji: "🎮", label: "Play", color: "#22C7A9" },
  explore: { emoji: "🧩", label: "Explore", color: "#8B5CF6" },
  me: { emoji: "🦊", label: "Me", color: "#FFB400" },
};

function TabItem({
  focused,
  emoji,
  label,
  color,
  onPress,
}: {
  focused: boolean;
  emoji: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  const { s } = useResponsive();
  const p = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    p.value = withSpring(focused ? 1 : 0, { damping: 12, stiffness: 180 });
  }, [focused, p]);

  const bubble = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scale: 0.6 + p.value * 0.4 }],
  }));
  const icon = useAnimatedStyle(() => ({
    transform: [{ translateY: -p.value * 4 }, { scale: 1 + p.value * 0.15 }],
  }));

  return (
    <PressableScale
      onPress={onPress}
      haptic={false}
      scaleTo={0.92}
      style={[styles.item, { minHeight: Math.max(56, s(60)) }]}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
    >
      <View
        style={{
          width: s(54),
          height: s(54),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: color, borderRadius: s(18) },
            bubble,
          ]}
        />
        <Animated.Text style={[{ fontSize: s(28) }, icon]}>
          {emoji}
        </Animated.Text>
      </View>
      <Text
        style={[styles.label, { fontSize: s(12) }, focused && { color }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

export function GameTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { s } = useResponsive();

  return (
    <View style={styles.backdrop}>
      <View
        style={[
          styles.wrap,
          { paddingBottom: Math.max(insets.bottom, s(8)), paddingTop: s(8) },
        ]}
      >
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const tab = TABS[route.name];
            if (!tab) return null;
            const focused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
                playSound("tap");
                haptic.tap();
              }
            };
            return (
              <TabItem
                key={route.key}
                focused={focused}
                emoji={tab.emoji}
                label={tab.label}
                color={tab.color}
                onPress={onPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    width: "100%",
    backgroundColor: colors.bg,
  },
  wrap: {
    backgroundColor: "#141B3D",
    borderTopWidth: 2,
    borderColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 520,
    paddingHorizontal: 16,
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center" },
  label: { ...typography.caption, color: "#8A8FA3", marginTop: 2 },
});
