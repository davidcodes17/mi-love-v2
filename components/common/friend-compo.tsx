import { Image, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { Call, Message2 } from "iconsax-react-native";
import { COLORS } from "@/config/theme";
import NativeButton from "../ui/native-button";

const FriendCompo = ({ isFriend }: { isFriend: boolean }) => {
  const [imageError, setImageError] = useState(false);

  return (
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
                  uri: "https://cdn.dribbble.com/userupload/36974838/file/original-c2508a14d3725cbfa022122d6ada6015.jpg?resize=752x&vertical=center",
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
            areegbedavid
          </ThemedText>
          <ThemedText>Areegbe David</ThemedText>
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
  );
};

export default FriendCompo;

const styles = StyleSheet.create({});
