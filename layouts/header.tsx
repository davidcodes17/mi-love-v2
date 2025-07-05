import { StyleSheet, Text, View } from "react-native";
import React from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import {
  Notification,
  SearchFavorite,
  SearchNormal1,
} from "iconsax-react-native";
import { COLORS } from "@/config/theme";
import { Href, Link } from "expo-router";

const Header = () => {
  return (
    <View>
      <ThemedView
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <ThemedText fontSize={25}>Discover</ThemedText>

        <ThemedView flexDirection="row" gap={20}>
          <Link href={"/(search)/search" as Href}>
            <ThemedView
              borderColor={COLORS.primary}
              borderWidth={0.5}
              alignSelf="center"
              justifyContent="center"
              padding={10}
              borderRadius={200}
            >
              <SearchNormal1 size={15} color={COLORS.primary} />
            </ThemedView>
          </Link>
          <Link href={"/notifications"}>
            <ThemedView
              borderColor={COLORS.primary}
              borderWidth={0.5}
              alignSelf="center"
              justifyContent="center"
              padding={10}
              borderRadius={200}
            >
              <Notification size={15} color={COLORS.primary} />
            </ThemedView>
          </Link>
        </ThemedView>
      </ThemedView>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({});
