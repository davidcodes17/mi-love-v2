import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { COLORS } from "@/config/theme";
import { Heart } from "iconsax-react-native";

const Post = () => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);

  const fullText =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem ullam molestias ducimus voluptate necessitatibus iure aperiam veniam quidem nihil inventore.";
  const shortText = fullText.slice(0, 70) + "...";

  return (
    <ThemedView position="relative">
      <Image
        source={{
          uri: "https://img.freepik.com/free-photo/young-beautiful-girl-posing-black-leather-jacket-park_1153-8104.jpg?semt=ais_hybrid&w=740",
        }}
        style={{
          width: "100%",
          height: 400,
          borderRadius: 20,
        }}
      />

      <ThemedView
        position="absolute"
        bottom={0}
        left={0}
        width={"100%"}
        backgroundColor={"rgba(0, 0, 0, 0.7)"}
        borderRadius={20}
        padding={20}
      >
        <ThemedView
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <ThemedView
            flexDirection="row"
            alignItems="center"
            gap={10}
            marginBottom={5}
          >
            <Image
              source={{
                uri: "https://img.freepik.com/free-photo/young-beautiful-girl-posing-black-leather-jacket-park_1153-8104.jpg?semt=ais_hybrid&w=740",
              }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 200,
              }}
            />
            <ThemedView>
              <ThemedText fontSize={15} weight="bold" color={"#fff"}>
                Nathan Rusi
              </ThemedText>
              <ThemedText weight="light" color={"#fff"}>
                @nathanrusi
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView flexDirection="row" alignItems="center" gap={10}>
            <ThemedText
              backgroundColor={COLORS.primary}
              color={"#fff"}
              padding={7.5}
              borderRadius={200}
              fontSize={12}
              paddingHorizontal={15}
            >
              Add Friend
            </ThemedText>
            <ThemedView borderColor={"#fff"} borderWidth={0.5} padding={5} borderRadius={200}>
              <Heart size={18} color="#fff" />
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView paddingBottom={10} alignItems="center">
          <ThemedText fontSize={12} color={"#fff"} flexWrap={"wrap"}>
            {expanded ? fullText : shortText}{" "}
            <TouchableOpacity onPress={toggleExpanded}>
              <ThemedText color={COLORS.primary} fontSize={12}>
                {expanded ? "Less" : "More"}
              </ThemedText>
            </TouchableOpacity>
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

export default Post;

const styles = StyleSheet.create({});
