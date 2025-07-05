import React from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";
import ThemedView from "../ui/themed-view";
import { SearchFavorite } from "iconsax-react-native";

const SearchInput = ({ ...rest }: TextInputProps) => {
  return (
    <ThemedView
      borderColor={"#ddd"}
      borderWidth={0.5}
      paddingHorizontal={15}
      gap={15}
      borderRadius={10}
      flexDirection="row"
      alignItems="center"
    >
      <SearchFavorite size={20} color="#ddd" />
      <TextInput
        style={styles.input}
        placeholder="Search..."
        placeholderTextColor="#999"
        {...rest}
      />
    </ThemedView>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    borderRadius: 10,
    fontFamily: "Quicksand_500Medium",
    color: "#000", // Optional: set to your theme's default text color
  },
});
