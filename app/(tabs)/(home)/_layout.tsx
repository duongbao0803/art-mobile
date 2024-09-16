import { Stack } from "expo-router";
import React from "react";

const HomeLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "orange",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        options={{
          headerTitleAlign: "center",
          headerTitle: "List products",
        }}
      />
      <Stack.Screen
        name="Detail"
        options={{
          headerTitleAlign: "center",
          headerTitle: "Detail",
        }}
      />
    </Stack>
  );
};

export default HomeLayout;
