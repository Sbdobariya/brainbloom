import { BannerSlot } from "@/core/ads";
import { GameTabBar } from "@/core/components/GameTabBar";
import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { View } from "react-native";

const renderTabBar = (props: BottomTabBarProps) => (
  <View>
    <BannerSlot />
    <GameTabBar {...props} />
  </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" },
      }}
      tabBar={renderTabBar}
    >
      <Tabs.Screen name="index" options={{ title: "Play" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="me" options={{ title: "Me" }} />
    </Tabs>
  );
}
