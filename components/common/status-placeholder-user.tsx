import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { Add } from "iconsax-react-native";

const StatusPlaceholderUser = () => {
  return (
    <ThemedView
      borderWidth={0.3}
      borderColor={"#ddd"}
      width={120}
      height={150}
      padding={15}
      borderRadius={10}
      justifyContent="space-between"
    >
      <ThemedView position="relative">
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1557296387-5358ad7997bb?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFjZSUyMHdvbWFufGVufDB8fDB8fHww",
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 200,
          }}
        />
        <ThemedView
          position="absolute"
          left={20}
          borderWidth={.2}
          borderColor={"#ddd"}
          backgroundColor={"#000"}
          borderRadius={200}
          bottom={-5}
          padding={2}
        >
          <Add color="#FFF" size={18} />
        </ThemedView>
      </ThemedView>
      <ThemedText fontSize={12} paddingTop={5}>
        Add Status
      </ThemedText>
    </ThemedView>
  );
};

export default StatusPlaceholderUser;

const styles = StyleSheet.create({});
