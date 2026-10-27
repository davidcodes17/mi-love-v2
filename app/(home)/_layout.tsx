import { Tabs } from "expo-router";
import React from "react";

import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import BottomNav from "@/components/ui/bottom-nav";


const CustomBottomTabs = (props: BottomTabBarProps) => {
  return <BottomNav {...props} />;
};


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={CustomBottomTabs}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="add" />
      <Tabs.Screen name="reels" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="friends" options={{ href: null }} />
      <Tabs.Screen name="inbox" options={{ href: null }} />
    </Tabs>
  );
}
