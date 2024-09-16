import React, { useCallback, useLayoutEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import { Picker } from "react-native-ui-lib";
import { ArrowDown2, FilterSearch } from "iconsax-react-native";
import { IconButton } from "react-native-paper";
import { Art } from "@/types/art.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NotFound from "@/assets/images/logo/—Pngtree—not found_5408094.png";

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [art, setArt] = useState<Art[]>([]);
  const [favorites, setFavorites] = useState<Art[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>("");

  const filterArt = art.filter((item) =>
    selectedBrand ? item.brand === selectedBrand : true,
  );

  useLayoutEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await axios.get(
          "https://66e12e90c831c8811b53ff13.mockapi.io/api/v1/art",
        );
        setArt(res.data);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        console.error("Error fetching data", err);
      }
    }
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      async function getFavorites() {
        const storedFavorites = await AsyncStorage.getItem("favorites");
        setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
      }
      getFavorites();
    }, []),
  );

  const toggleFavorite = async (art: Art) => {
    if (favorites.some((item) => item.id === art.id)) {
      ToastAndroid.show("Already in favorite list", ToastAndroid.SHORT);
    } else {
      const updatedFavorites = [...favorites, art];
      ToastAndroid.show("Added to favorite list", ToastAndroid.SHORT);
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    }
  };

  const Item = ({ item }: { item: Art }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(home)/Detail",
          params: { item: JSON.stringify(item) },
        })
      }
      className="m-2 flex-1 items-center rounded-lg bg-white shadow-md shadow-slate-600"
    >
      <Image
        source={{ uri: item.image }}
        className="my-3 h-32 w-full overflow-hidden"
        resizeMode="contain"
      />
      <View className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1">
        <Text className="text-xs font-bold text-white">
          {item.limitedTimeDeal * 100}% OFF
        </Text>
      </View>
      <View className="flex-1 items-center p-3">
        <View className="flex-grow items-center justify-between gap-y-1">
          <Text className="text-center text-sm font-bold" numberOfLines={2}>
            {item.artName}
          </Text>
        </View>
      </View>
      <View className="w-full flex-row">
        <View className="border-0.5 flex-1 items-center justify-center rounded-bl-lg border-gray-300 bg-gray-50 p-2 shadow-md">
          <Text className="text-lg font-bold text-red-600">${item.price}</Text>
        </View>
        <View className="border-0.5 flex-2 items-center justify-center rounded-br-lg border-gray-300 bg-gray-50 text-red-600 shadow-md">
          <IconButton
            icon={
              favorites.some((fav) => fav.id === item.id)
                ? "heart"
                : "heart-outline"
            }
            size={20}
            onPress={() => toggleFavorite(item)}
            iconColor={"red"}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <View className="flex-1 px-1">
      <View className="m-2">
        <View className="flex-row items-center justify-end">
          <View className="flex-row items-center justify-between rounded-md bg-white text-center">
            <FilterSearch size="15" color="black" className="ml-1" />
            <Picker
              value={selectedBrand ?? ""}
              onChange={(brand) => {
                if (typeof brand === "string" || brand === null) {
                  setSelectedBrand(brand);
                } else {
                  setSelectedBrand(null);
                }
              }}
              placeholder="Filter by brand"
              topBarProps={{ title: "Select Brand" }}
              enableModalBlur={false}
              className="border-0 text-center text-[10px]"
            >
              <Picker.Item
                label="All brands"
                value=""
                selectedIconColor="green"
              />
              {Array.from(new Set(art.map((item) => item?.brand))).map(
                (brand) => (
                  <Picker.Item
                    key={brand}
                    label={brand}
                    value={brand}
                    selectedIconColor="green"
                  />
                ),
              )}
            </Picker>
            <ArrowDown2 size="15" color="#FF8A65" className="mr-2" />
          </View>
        </View>
      </View>
      {filterArt.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Image source={NotFound} className="h-52 w-full object-cover" />
          <Text className="font-normal tracking-widest text-gray-400">
            No results found
          </Text>
        </View>
      ) : (
        <FlatList
          data={filterArt}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Item item={item} />}
          showsVerticalScrollIndicator={false}
          numColumns={2}
        />
      )}
    </View>
  );
};

export default HomeScreen;
