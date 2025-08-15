import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { COLORS } from "@/config/theme";
import { Link, router } from "expo-router";

const ChatCompo = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity onPress={()=>{
      router.push("/(chats)/chats")
    }} style={{
      flex : 1
    }}>
    <ThemedView
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      borderBottomWidth={1}
      borderColor={"#ddd"}
      paddingVertical={20}
    >
      <ThemedView flexDirection="row" alignItems="center" gap={10}>
        <Image
          source={
            imageError
              ? require("../../assets/users.jpg")
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
            Areegbe David
          </ThemedText>
          <ThemedText>Bro how far that stuff..</ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedView>
        <ThemedText>12:34PM</ThemedText>
        <ThemedView justifyContent="center" flexDirection="row" marginTop={2}>
          <ThemedText
            width={20}
            height={20}
            backgroundColor={COLORS.primary}
            borderRadius={200}
            textAlign="center"
            paddingTop={4}
            fontSize={10}
            color={"#fff"}
          >
            1
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
    </TouchableOpacity>
  );
};

export default ChatCompo;
