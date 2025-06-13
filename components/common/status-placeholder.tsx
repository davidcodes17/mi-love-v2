import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { COLORS } from "@/config/theme";

const StatusPlaceholder = () => {
  return (
    <ThemedView position="relative" marginRight={10}>
      <Image
        source={{
          uri: "https://www.shutterstock.com/image-photo/happy-beautiful-african-girl-afro-600nw-1810651855.jpg",
        }}
        style={{
          width: 120,
          height: 150,
          borderRadius: 10,
        }}
        resizeMode="cover"
      />
      <ThemedView
        backgroundColor={"rgba(0, 0, 0, 0.5)"}
        position="absolute"
        top={0}
        left={0}
        width={120}
        height={150}
        borderRadius={10}
        padding={10}
      >
        <ThemedView justifyContent="space-between" flex={1}>
          <ThemedView>
            <ThemedText
              backgroundColor={COLORS.primary}
              color={"#fff"}
              alignSelf="flex-start"
              padding={5}
              paddingHorizontal={5}
              borderRadius={5}
              fontSize={10}
              weight="semibold"
            >
              NEW
            </ThemedText>
          </ThemedView>
          <ThemedView>
            <Image
              source={{
                uri: "https://www.shutterstock.com/image-photo/happy-beautiful-african-girl-afro-600nw-1810651855.jpg",
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 100,
              }}
              resizeMode="cover"
            />
            <ThemedText color={"#fff"} paddingTop={2} fontSize={12} weight="medium">23 hours ago</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

export default StatusPlaceholder;

const styles = StyleSheet.create({});
