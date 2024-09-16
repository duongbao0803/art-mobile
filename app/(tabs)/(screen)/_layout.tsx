import { Stack } from "expo-router";
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

const ScreenLayout = () => {
  const navigation = useNavigation();

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
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 15 }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>{"<"}</Text>
          </TouchableOpacity>
        ),
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
