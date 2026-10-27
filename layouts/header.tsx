import { StyleSheet, View, TouchableOpacity } from "react-native";
import React from "react";
import { ThemedText } from "@/components/ui/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import useTheme from "@/hooks/use-theme";

const Header = () => {
  const theme = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      <View style={styles.brand}>
        <View style={[styles.brandMark, { backgroundColor: theme.colors.soft }]}>
          <Ionicons name="heart" size={16} color={theme.colors.primary} />
        </View>
        <ThemedText style={[styles.logo, { color: theme.colors.text }]}>mi love</ThemedText>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => router.push("/(notifications)/notifications" as Href)}
          hitSlop={10}
          style={[styles.iconBtn, { backgroundColor: theme.colors.soft }]}
        >
          <Ionicons name="heart-outline" size={21} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(home)/inbox" as Href)}
          hitSlop={10}
          style={[styles.iconBtn, { backgroundColor: theme.colors.soft }]}
        >
          <Ionicons name="paper-plane-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#dbdbdb",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
