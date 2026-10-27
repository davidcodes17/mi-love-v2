import React from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";
import ThemedView from "../ui/themed-view";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "@/hooks/use-theme";

const SearchInput = ({ ...rest }: TextInputProps) => {
  const theme = useTheme();

  return (
    <ThemedView
      backgroundColor={theme.colors.soft}
      paddingHorizontal={15}
      gap={10}
      borderRadius={16}
      flexDirection="row"
      alignItems="center"
      borderWidth={1}
      borderColor={theme.colors.border}
    >
      <Ionicons name="search" size={18} color={theme.colors.muted} />
      <TextInput
        style={[styles.input, { color: theme.colors.text }]}
        placeholder="Search..."
        placeholderTextColor={theme.colors.muted}
        {...rest}
      />
    </ThemedView>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#281a22",
    paddingVertical: 0,
  },
});
