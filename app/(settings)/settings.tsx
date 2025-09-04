import { SafeAreaView, StyleSheet, TouchableOpacity, View, Alert, Linking } from "react-native";
import React from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import {
  ArrowRight2,
  Setting2,
  Wallet,
  Gift,
  LogoutCurve,
  Trash,
  ShieldTick,
} from "iconsax-react-native";
import { COLORS } from "@/config/theme";
import { Href, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Settings = () => {
  const router = useRouter();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Replace with real delete account logic
            Alert.alert("Account Deleted", "Your account has been deleted.");
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              // If you store token under a specific key, you can also do:
              // await AsyncStorage.removeItem('token');
              router.replace("/"); // Redirect to home/default screen
            } catch (e) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  const settingsLinks = [
    {
      label: "Account Information",
      icon: <Setting2 size={22} color={COLORS.primary} variant="Bold" />,
      onPress: () => router.push("/edit-account"),
    },
    {
      label: "Wallet",
      icon: <Wallet size={22} color={COLORS.primary} variant="Bold" />,
      onPress: () => router.push("/(settings)/wallet" as Href),
    },
    {
      label: "Logout",
      icon: <LogoutCurve size={22} color={COLORS.primary} variant="Bold" />,
      onPress: handleLogout,
    },
    {
      label: "Delete Account",
      icon: <Trash size={22} color={COLORS.primary} variant="Bold" />,
      onPress: handleDeleteAccount,
      isDestructive: true,
    },
    {
      label: "Privacy and Policy",
      icon: <ShieldTick size={22} color={COLORS.primary} variant="Bold" />,
      onPress: () => Linking.openURL("https://mi-love-gilt.vercel.app/privacy.html"),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ThemedView padding={20}>
        {/* Redesigned Header */}
        <ThemedView marginBottom={18}>
          <ThemedText
            fontSize={26}
            weight="medium"
            textAlign="center"
            letterSpacing={0.5}
          >
            Settings
          </ThemedText>
          <View
            style={{
              height: 1,
              backgroundColor: "#eee",
              marginTop: 12,
              marginHorizontal: -20,
            }}
          />
        </ThemedView>

        <ThemedView gap={2}>
          {settingsLinks.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              activeOpacity={0.7}
              style={styles.row}
            >
              <ThemedView flexDirection="row" alignItems="center" gap={15}>
                {item.icon}
                <ThemedText fontSize={17} color={item.isDestructive ? "#d00" : undefined}>
                  {item.label}
                </ThemedText>
              </ThemedView>
              <ArrowRight2 size={18} color="#bbb" />
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 2,
    paddingHorizontal: 8,
  },
});
