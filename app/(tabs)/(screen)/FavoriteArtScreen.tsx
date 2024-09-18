import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  ActivityIndicator,
  ToastAndroid,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Art } from "@/types/art.types";
import NotFound from "@/assets/images/logo/—Pngtree—not found_5408094.png";
import { Checkbox } from "react-native-ui-lib";
import { router, useFocusEffect } from "expo-router";
import { Searchbar } from "react-native-paper";
import useDebounce from "@/hooks/useDebounce";
import { ButtonComponent } from "@/components/custom";
import { isItemSelected } from "react-native-ui-lib/src/components/picker/PickerPresenter";

const FavoritesScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Art[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const debounceSearchQuery = useDebounce(searchQuery, 300);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("favorites");
      setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error("Error fetching favorites", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, []),
  );

  const toggleSelectAll = () => {
    if (isSelectAll) {
      setSelectedItems(new Set());
    } else {
      const allSelect = new Set(favorites.map((item) => item.id));
      setSelectedItems(allSelect);
    }
    setIsSelectAll(!isSelectAll);
  };

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  }, []);

  const removeSelectedFavorites = useCallback(async () => {
    try {
      if (selectedItems.size > 0) {
        const updatedFavorites = favorites.filter(
          (item) => !selectedItems.has(item.id),
        );
        setFavorites(updatedFavorites);
        await AsyncStorage.setItem(
          "favorites",
          JSON.stringify(updatedFavorites),
        );
        setSelectedItems(new Set());
        ToastAndroid.show("Removed selected art tool", ToastAndroid.SHORT);
      }
    } catch (err) {
      console.error("Error removing art tool", err);
    }
  }, [favorites, selectedItems]);

  const confirmRemoveSelectedFavorites = () => {
    if (selectedItems.size > 0) {
      Alert.alert(
        "Confirm Remove Art",
        "Are you sure you want to remove the selected art tool?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: removeSelectedFavorites,
          },
        ],
        { cancelable: false },
      );
    } else {
      ToastAndroid.show("Please choose selected art tool", ToastAndroid.SHORT);
    }
  };

  const filteredFavorites = favorites.filter((item) =>
    item?.artName?.toLowerCase().includes(debounceSearchQuery.toLowerCase()),
  );

  useEffect(() => {
    if (searchQuery) {
      setIsDebouncing(true);
      const timer = setTimeout(() => {
        setIsDebouncing(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setIsDebouncing(false);
    }
  }, [searchQuery]);

  const Item = React.memo(({ item }: { item: Art }) => (
    <View className="m-2 flex-row items-center rounded-lg bg-white p-2 shadow-lg">
      <Checkbox
        value={selectedItems.has(item.id)}
        onValueChange={() => toggleSelection(item.id)}
        color="orange"
        className="mx-2 rounded-[5px]"
        size={23}
      />
      <View className="mx-2 h-3/4 w-[1px] bg-orange-400" />
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(home)/Detail",
            params: { item: JSON.stringify(item) },
          })
        }
        className="flex-1 flex-row items-center justify-center gap-x-4"
      >
        <Image
          source={{ uri: item.image }}
          className="h-32 w-32 rounded"
          resizeMode="contain"
        />
        <View className="ml-2 flex-1">
          <Text className="text-lg font-bold">{item.artName}</Text>
          <Text className="text-lg text-red-600">${item.price}</Text>
        </View>
      </TouchableOpacity>
    </View>
  ));

  return (
    <View className="flex-1 px-1">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="orange" />
        </View>
      ) : (
        <View className="flex-1">
          {favorites.length > 0 && (
            <>
              <View className="m-2">
                <Searchbar
                  placeholder="Search favorites..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  className="rounded-lg bg-white p-0"
                />
              </View>
              <View className="mx-2 flex items-end">
                <ButtonComponent
                  text={isSelectAll ? "Deselect all" : "Select all"}
                  onPress={toggleSelectAll}
                  buttonStyle="bg-blue-500 w-1/3 float-right p-2 bg-orange-300 text-center rounded-lg"
                  textStyle="text-center text-white"
                />
              </View>
            </>
          )}

          {isDebouncing ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="orange" />
            </View>
          ) : (
            <>
              {filteredFavorites.length === 0 ? (
                <View className="flex-1 items-center justify-center gap-5">
                  <Image
                    source={NotFound}
                    className="h-52 w-full"
                    resizeMode="contain"
                  />
                  <Text className="font-normal tracking-widest text-gray-400">
                    No favorites found
                  </Text>
                </View>
              ) : (
                <>
                  <FlatList
                    data={filteredFavorites}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <Item item={item} />}
                    showsVerticalScrollIndicator={false}
                  />

                  <ButtonComponent
                    text="Remove Selected"
                    onPress={confirmRemoveSelectedFavorites}
                    buttonStyle="bg-red-500 p-3 text-center rounded-lg mx-2 my-4"
                    textStyle="text-center text-white"
                  />
                </>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default FavoritesScreen;
