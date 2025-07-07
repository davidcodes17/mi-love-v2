import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import {
  ArrowRight,
  ArrowRight2,
  Setting,
  Setting2,
} from "iconsax-react-native";
import { COLORS } from "@/config/theme";

const Settings = () => {
  return (
    <SafeAreaView>
      <ThemedView padding={20}>
        <ThemedView
          flexDirection="row"
          alignItems="center"
          gap={10}
          justifyContent="center"
        >
          <Setting2 size={35} color={COLORS.primary} variant="Bold" />
          <ThemedText fontSize={25}>Settings</ThemedText>
        </ThemedView>

        <ThemedView
          flexDirection="row"
          justifyContent="space-between"
          paddingVertical={10}
          alignItems="center"
          borderBottomColor={"#ddd"}
          borderBottomWidth={.4}
        >
          <ThemedText fontSize={20}>Acount Information</ThemedText>
          <ArrowRight2 size={20} color="#000" />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({});
