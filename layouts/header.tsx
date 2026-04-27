import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { Alarm, SearchNormal1 } from "iconsax-react-native";
import { COLORS } from "@/config/theme";
import { Href, Link, router } from "expo-router";
import * as Location from "expo-location";
import { useInitiatePanicButton } from "@/hooks/auth-hooks.hooks";

const Header = () => {
  const [loading, setLoading] = useState(false);

  const handlePanicButton = async () => {
    try {
      setLoading(true);

      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location access is required for panic button."
        );
        setLoading(false);
        return;
      }

      // Get location
      let currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      // Call API hook
      const response = await useInitiatePanicButton({
        data: {
          phone_number: undefined, // will fall back to user.emergency_contact on backend
          latitude,
          longitude,
          reason: "Help Me",
        },
      });

      console.log("Panic button response:", response);

      if (response?.success) {
        Alert.alert(
          "Panic Alert Sent",
          response.data?.message ?? "Your panic alert email has been sent to your registered email address.",
          [{ text: "OK" }]
        );
      } else if (
        response?.data?.message === "Panic Alert not sent due to missing registered email"
      ) {
        Alert.alert(
          "Registered Email Missing",
          "We could not send your panic alert because your account does not have a registered email. Please update your email and try again.",
          [{ text: "OK" }]
        );
      } else if (response?.status === 502) {
        Alert.alert(
          "Panic Alert Failed",
          "Failed to deliver your panic alert email. Please try again or contact support.",
          [{ text: "Retry", onPress: handlePanicButton }, { text: "Cancel" }]
        );
      } else {
        Alert.alert(
          "Error",
          response?.data?.message ?? "Failed to send panic alert. Please try again.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

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
            <TouchableOpacity onPress={()=>{
              router.push("/(search)/search" as Href)
            }}>
              <ThemedView
                borderColor={COLORS.primary}
                borderWidth={0.5}
                alignSelf="center"
                flexDirection="row"
                justifyContent="center"
                padding={10}
                borderRadius={200}
              >
                <SearchNormal1 size={15} color={COLORS.primary} />
              </ThemedView>
              <ThemedText paddingTop={2} color={COLORS.primary} fontSize={12}>
                Search
              </ThemedText>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity disabled={loading} onPress={handlePanicButton}>
            <ThemedView
              borderColor={COLORS.primary}
              borderWidth={0.5}
              alignSelf="center"
              justifyContent="center"
              padding={10}
              flexDirection="row"
              borderRadius={200}
            >
              <Alarm
                variant="Bold"
                size={15}
                color={loading ? "gray" : COLORS.primary}
              />
            </ThemedView>
            <ThemedText paddingTop={2} color={COLORS.primary} fontSize={12}>
            {loading ? "Sending alert..." : "Panic Button"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({});
