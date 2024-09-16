import React from "react";
import { Tabs, usePathname } from "expo-router";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

export default function TabLayout() {
  const pathname = usePathname();

  const shouldHideTabBar = pathname === "/Detail";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "orange",
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarStyle: shouldHideTabBar ? { display: "none" } : {},
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(screen)"
        options={{
          title: "Screen",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "code-slash" : "code-slash-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
