import { Pressable, StyleSheet } from "react-native";
import React from "react";
import ThemedView from "../ui/themed-view";
import { ArrowLeft, ArrowLeft2 } from "iconsax-react-native";
import { router } from "expo-router";

const BackButton = () => {
  return (
    <Pressable
      onPress={() => {
        router.back();
      }}
    >
      <ThemedView
        borderColor={"#ddd"}
        borderWidth={0.3}
        padding={15}
        borderRadius={10}
        alignSelf="flex-start"
      >
        <ArrowLeft2 size={20} color="#000" />
      </ThemedView>
    </Pressable>
  );
};

export default BackButton;

const styles = StyleSheet.create({});
