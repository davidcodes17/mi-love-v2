import {
  SafeAreaView,
  ScrollView,
  Image,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import BackButton from "@/components/common/back-button";
import NativeButton from "@/components/ui/native-button";
import { COLORS } from "@/config/theme";
import { More } from "iconsax-react-native";
import { useGetSingleFriend } from "@/hooks/friend-hooks.hooks";
import { generateURL } from "@/utils/image-utils.utils";
import { UserProfileR } from "@/types/auth.types";
import { router, useLocalSearchParams } from "expo-router";

const ViewFriend = () => {
  const { id: friendId } = useLocalSearchParams<{ id: string }>();
  const [friend, setFriend] = useState<UserProfileR | null>(null);

  useEffect(() => {
    if (!friendId) return;
    const fetchFriend = async () => {
      const response = await useGetSingleFriend({ id: friendId });
      setFriend(response?.data || response); // fallback for direct UserProfileR
    };
    fetchFriend();
  }, [friendId]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <BackButton />
          <ThemedText weight="bold">{friend?.username || "-"}</ThemedText>
          <TouchableOpacity
            style={{
              opacity: 0,
            }}
            onPress={() => router.push("/settings")}
          >
            <ThemedView>
              <More variant="Outline" color="#000" size={30} />
            </ThemedView>
          </TouchableOpacity>
        </ThemedView>
        <ThemedView>
          <ThemedView
            flexDirection="row"
            justifyContent="center"
            marginTop={20}
          >
            <Image
              source={
                friend?.profile_picture?.url
                  ? { uri: generateURL({ url: friend.profile_picture.url }) }
                  : require("@/assets/user.png")
              }
              style={{ width: 100, height: 100, borderRadius: 100 }}
            />
          </ThemedView>
          <ThemedView>
            <ThemedText
              weight="bold"
              fontSize={20}
              textAlign="center"
              marginTop={10}
            >
              {friend ? `${friend.first_name} ${friend.last_name}` : "-"}
            </ThemedText>
            <ThemedText
              fontSize={12}
              textAlign="center"
              paddingHorizontal={20}
              paddingVertical={5}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {friend?.bio || "No bio set."}
            </ThemedText>
            <ThemedView
              justifyContent="space-around"
              flexDirection="row"
              gap={50}
              marginTop={20}
            >
              <ThemedView>
                <ThemedText textAlign="center" weight="medium" fontSize={20}>
                  {/* Posts count placeholder */}0
                </ThemedText>
                <ThemedText textAlign="center" fontSize={15} color={"#aaa"}>
                  Posts
                </ThemedText>
              </ThemedView>
              <ThemedView>
                <ThemedText textAlign="center" weight="medium" fontSize={20}>
                  16.1M
                </ThemedText>
                <ThemedText textAlign="center" fontSize={15} color={"#aaa"}>
                  Followers
                </ThemedText>
              </ThemedView>
              <ThemedView>
                <ThemedText textAlign="center" weight="medium" fontSize={20}>
                  125
                </ThemedText>
                <ThemedText textAlign="center" fontSize={15} color={"#aaa"}>
                  Following
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView flexDirection="row" marginTop={20}>
              <NativeButton
                mode="outline"
                text={"Unfriend"}
                style={{ flex: 1, marginRight: 10, borderRadius: 200 }}
              />
              <NativeButton
                mode="fill"
                text={"Chats"}
                style={{ flex: 1, borderRadius: 200 }}
              />
            </ThemedView>
            {/* Posts grid placeholder (future) */}
            {/* <ProfileImageGrid posts={posts} linkBase="/(home)/view-friend" /> */}
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewFriend;

const styles = StyleSheet.create({});
