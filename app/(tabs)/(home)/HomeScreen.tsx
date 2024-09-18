import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Picker } from "react-native-ui-lib";
import { ArrowDown2, FilterSearch } from "iconsax-react-native";
import { IconButton } from "react-native-paper";
import { Art } from "@/types/art.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NotFound from "@/assets/images/logo/—Pngtree—not found_5408094.png";
import useFetch from "@/hooks/useFetch";
import { API_URLS } from "@/constants/url";

const HomeScreen = () => {
  const [favorites, setFavorites] = useState<Art[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>("");
  const { data: art, isLoading } = useFetch<Art[]>(API_URLS.ART);

  const filterArt = useMemo(
    () =>
      (selectedBrand
        ? art?.filter((item) => item.brand === selectedBrand)
        : art) || [],
    [art, selectedBrand],
  );

  useFocusEffect(
    useCallback(() => {
      async function getFavorites() {
        const storedFavorites = await AsyncStorage.getItem("favorites");
        setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
      }
      getFavorites();
    }, []),
  );

  const toggleFavorite = useCallback(
    async (art: Art) => {
      const alreadyFavorite = favorites.some((item) => item.id === art.id);
      if (alreadyFavorite) {
        ToastAndroid.show("Already in favorite list", ToastAndroid.SHORT);
      } else {
        const updatedFavorites = [...favorites, art];
        setFavorites(updatedFavorites);
        await AsyncStorage.setItem(
          "favorites",
          JSON.stringify(updatedFavorites),
        );
        ToastAndroid.show("Added to favorite list", ToastAndroid.SHORT);
      }
    },
    [favorites],
  );

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
          <View className="flex-row items-center justify-between rounded-md border bg-white px-1 text-center">
            <FilterSearch size="15" color="black" />
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
              className="mx-1 border-0 text-center"
            >
              <Picker.Item
                label="All brands"
                value=""
                selectedIconColor="orange"
              />
              {Array.from(new Set(art?.map((item) => item?.brand))).map(
                (brand) => (
                  <Picker.Item
                    key={brand}
                    label={brand}
                    value={brand}
                    selectedIconColor="orange"
                  />
                ),
              )}
            </Picker>
            <ArrowDown2 size="15" color="black" />
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
