import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  ToastAndroid,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Rating } from "react-native-elements";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ButtonComponent } from "@/components/custom";
import { IconButton, Modal, Portal, Provider } from "react-native-paper";
import NotFound from "@/assets/images/icon/logo_not_found.png";
import Avatar from "@/assets/images/icon/avatar.jpg";

const DetailScreen = () => {
  const [comments, setComments] = useState<{ text: string; rating: number }[]>(
    [],
  );
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [visible, setVisible] = useState(false);

  const route = useRoute();
  const { item } = route.params;
  const artItem = item ? JSON.parse(item) : null;
  const STORE_COMMENT = `comments-${artItem?.id}`;

  useEffect(() => {
    const loadComments = async () => {
      try {
        const storedComments = await AsyncStorage.getItem(STORE_COMMENT);
        if (storedComments) {
          setComments(JSON.parse(storedComments));
        }
      } catch (error) {
        console.error("Error loading comments", error);
      }
    };

    loadComments();
  }, [STORE_COMMENT]);

  const handleAddComment = async () => {
    if (newComment.trim() && rating > 0) {
      const updatedComments = [
        ...comments,
        { text: newComment.trim(), rating },
      ];
      try {
        await AsyncStorage.setItem(
          STORE_COMMENT,
          JSON.stringify(updatedComments),
        );
        setComments(updatedComments);
        setNewComment("");
        setRating(0);
        setVisible(false);
        ToastAndroid.show("Error saving comment", ToastAndroid.SHORT);
      } catch (error) {
        console.error("Error saving comment", error);
        ToastAndroid.show("Error saving comment", ToastAndroid.SHORT);
      }
    } else {
      ToastAndroid.show(
        "Please enter both comment and rating",
        ToastAndroid.SHORT,
      );
    }
  };

  return (
    <Provider>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1">
          <Image
            source={{ uri: artItem?.image }}
            className="mb-5 mt-10 h-96 w-full"
            resizeMode="contain"
          />

          <View className="flex-1 rounded-t-[30px] border-[0.5px]">
            <View className="p-5">
              <Text className="my-2 text-2xl font-bold">
                {artItem?.artName}
              </Text>

              <Text className="mb-2 text-sm font-medium text-gray-500">
                Brand: {artItem?.brand}
              </Text>

              <Text className="mb-2 text-sm text-gray-300">
                Description: {artItem?.description}
              </Text>

              <View className="mb-2 flex-row items-center">
                <Text className="mr-2 text-2xl font-bold text-red-500">
                  ${artItem?.price.toFixed(2)}
                </Text>
                <Text className="text-lg text-gray-500 line-through">
                  $
                  {(
                    artItem?.price +
                    artItem?.price * artItem?.limitedTimeDeal
                  ).toFixed(2)}
                </Text>
              </View>

              {/* Emphasized Limited Time Deal */}
              {artItem?.limitedTimeDeal > 0 && (
                <View className="mb-4 rounded-lg border border-red-500 bg-red-100 p-3">
                  <Text className="text-center text-lg font-bold text-red-700">
                    {artItem?.limitedTimeDeal * 100}% Off!
                  </Text>
                  <Text className="text-center text-sm text-red-500">
                    Limited Time Deal - Hurry Up!
                  </Text>
                </View>
              )}

              <ButtonComponent
                onPress={() => setVisible(true)}
                text="Add Comment"
                textStyle="text-red-500 font-medium text-center text-white"
                buttonStyle="bg-orange-300 p-3 rounded-md"
              />

              <View className="mt-4 flex-1">
                <Text className="text-lg font-bold">Comments:</Text>
                {comments.length === 0 ? (
                  <View className="my-4 flex-1 items-center justify-center">
                    <Image
                      source={NotFound}
                      className="h-32 w-full object-cover"
                    />
                    <Text className="font-normal tracking-widest text-gray-400">
                      No results found
                    </Text>
                  </View>
                ) : (
                  <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {comments.map((item, index) => (
                      <View
                        key={index}
                        className="mb-4 flex-row items-center gap-3 border-b border-gray-100"
                      >
                        <Image
                          source={Avatar}
                          className="h-12 w-12 rounded-full"
                          resizeMode="cover"
                        />
                        <View className="flex-1 py-5">
                          <Text className="mb-1">{item?.text}</Text>
                          <View className="flex-row items-center">
                            <Rating
                              imageSize={15}
                              readonly
                              startingValue={item?.rating}
                            />
                          </View>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <Portal>
          <Modal visible={visible} onDismiss={() => setVisible(false)}>
            <View className="relative mx-5 rounded-lg bg-white p-6">
              <IconButton
                icon="close"
                size={24}
                onPress={() => setVisible(false)}
                className="absolute right-0"
              />
              <Text className="mb-4 text-lg font-bold">Add a comment</Text>
              <Rating
                ratingCount={5}
                imageSize={30}
                startingValue={rating}
                onFinishRating={setRating}
              />
              <TextInput
                className="my-4 h-10 rounded-md border border-gray-400 px-2"
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <ButtonComponent
                onPress={handleAddComment}
                text="Submit"
                textStyle="text-white font-medium text-center"
                buttonStyle="bg-orange-300 p-3 rounded-md"
              />
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </Provider>
  );
};

export default DetailScreen;
