import { Image, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { router, Href } from "expo-router";
import { COLORS } from "@/config/theme";
import NativeButton from "../ui/native-button";
import { UserProfileR } from "@/types/auth.types";
import { generateURL } from "@/utils/image-utils.utils";
import { useAddFriend, useUnFriend } from "@/hooks/friend-hooks.hooks";

const FriendCompo = ({
  user,
  isFriend: initialIsFriend,
}: {
  user: UserProfileR;
  isFriend: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isFriend, setIsFriend] = useState(initialIsFriend);
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async () => {
    try {
      setLoading(true);
      const response = await useAddFriend({ id: user?.id });
      console.log("✅ Add friend response:", response);

      if (response?.message === "Added to friends list") {
        setIsFriend(true);
      }
    } catch (err) {
      console.error("❌ Add friend error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      setLoading(true);
      const response = await useUnFriend({ id: user?.id });
      console.log("✅ Unfriend response:", response);

      if (response?.message === "Removed from friends list") {
        setIsFriend(false);
      }
    } catch (err) {
      console.error("❌ Unfriend error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        router.push(("/view-friends?id=" + user?.id) as Href);
      }}
    >
      <ThemedView
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={40}
      >
        {/* Profile Picture + Names */}
        <ThemedView flexDirection="row" alignItems="center" gap={10}>
          <Image
            source={
              imageError
                ? require("@/assets/users.jpg")
                : { uri: generateURL({ url: user?.profile_picture?.url }) }
            }
            onError={() => setImageError(true)}
            style={{ width: 45, height: 45, borderRadius: 200 }}
            resizeMode="cover"
          />
          <ThemedView>
            <ThemedText fontSize={12} weight="bold">
              {user?.username || "Username"}
            </ThemedText>
            <ThemedText>
              {user?.first_name && user?.last_name
                ? `${user?.first_name} ${user?.last_name}`
                : "Full name"}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Action Button */}
        {isFriend ? (
          <NativeButton
            mode="fill"
            text={loading ? "Removing..." : "Unfriend"}
            onPress={handleRemoveFriend}
            style={{ paddingVertical: 10 }}
            disabled={loading}
          />
        ) : (
          <NativeButton
            mode="fill"
            text={loading ? "Adding..." : "Add Friend"}
            onPress={handleAddFriend}
            style={{ paddingVertical: 10 }}
            disabled={loading}
          />
        )}
      </ThemedView>
    </TouchableOpacity>
  );
};

export default FriendCompo;

const styles = StyleSheet.create({});
