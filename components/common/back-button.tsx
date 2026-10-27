import { Pressable, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import useTheme from "@/hooks/use-theme";

const BackButton = () => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={12}
      style={[styles.button, { backgroundColor: theme.colors.soft }]}
    >
      <Ionicons name="chevron-back" size={23} color={theme.colors.text} />
    </Pressable>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
