import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { Call, Message2 } from "iconsax-react-native";
import { COLORS } from "@/config/theme";
import NativeButton from "../ui/native-button";
import { UserProfileR } from "@/types/auth.types";
import { generateURL } from "@/utils/image-utils.utils";
import { Href, router } from "expo-router";

const FriendCompo = ({
  user,
  isFriend,
}: {
  user: UserProfileR;
  isFriend: boolean;
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity onPress={()=>{
      console.log(".....UUUUUU.")
      router.push("/view-friends?id="+user?.id as Href)
    }}>
    <ThemedView
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      marginBottom={40}
    >
      <ThemedView flexDirection="row" alignItems="center" gap={10}>
        <Image
          source={
            imageError
              ? require("@/assets/users.jpg")
              : {
                  uri: generateURL({ url: user?.profile_picture?.url }),
                }
          }
          onError={() => setImageError(true)}
          style={{
            width: 45,
            height: 45,
            borderRadius: 200,
          }}
          resizeMode="cover"
        />
        <ThemedView>
          <ThemedText fontSize={12} weight="bold">
            {user?.username || "Username"}
          </ThemedText>
          <ThemedText>
            {(user?.first_name &&
              user?.last_name &&
              `${user?.first_name} ${user?.last_name}`) ||
              "Full name"}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {isFriend ? (
        <ThemedView flexDirection="row" gap={10}>
          <ThemedView
            backgroundColor={COLORS.primary}
            padding={10}
            borderRadius={200}
          >
            <Message2 size={20} variant="Bold" color="#fff" />
          </ThemedView>
          <ThemedView
            backgroundColor={COLORS.primary}
            padding={10}
            borderRadius={200}
          >
            <Call size={20} variant="Bold" color="#fff" />
          </ThemedView>
        </ThemedView>
      ) : (
        <NativeButton
          mode="fill"
          text={"Add Friend"}
          style={{
            paddingVertical: 10,
          }}
        />
      )}
    </ThemedView>
    </TouchableOpacity>
  );
};

export default FriendCompo;

const styles = StyleSheet.create({});
