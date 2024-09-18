import { Stack } from "expo-router";
import React from "react";

const ScreenLayout = () => {
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
        name="FavoriteArtScreen"
        options={{
          title: "Favorites list",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
};

export default ScreenLayout;
