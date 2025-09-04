import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { Alarm } from "iconsax-react-native";
import { COLORS } from "@/config/theme";
import * as Location from "expo-location";
import { useInitiatePanicButton } from "@/hooks/auth-hooks.hooks";

const ChatPanicButton = () => {
  const [loading, setLoading] = useState(false);

  const handleChatPanic = async () => {
    try {
      setLoading(true);

      // ✅ Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location access is required for panic button."
        );
        setLoading(false);
        return;
      }

      // ✅ Get location
      let currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      // ✅ Call API hook
      const response = await useInitiatePanicButton({
        data: {
          latitude,
          longitude,
          reason: "Help Me - from Chat",
        },
      });

      console.log("Chat panic button response:", response);

      // ✅ Show confirmation modal
      Alert.alert(
        "Panic Request Sent",
        "Your panic alert has been sent successfully. Help is on the way!",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Chat panic button error:", error);
      Alert.alert("Error", "Failed to send panic request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity disabled={loading} onPress={handleChatPanic}>
        <ThemedView
          borderColor={loading ? "gray" : COLORS.primary}
          borderWidth={0.5}
          alignSelf="center"
          justifyContent="center"
          padding={10}
          flexDirection="row"
          borderRadius={200}
        >
          <Alarm
            variant="Bold"
            size={20}
            color={loading ? "gray" : COLORS.primary}
          />
        </ThemedView>
        {/* <ThemedText paddingTop={2} textAlign="center" color={COLORS.primary} fontSize={12}>
          {loading ? "Sending..." : "Panic"}
        </ThemedText> */}
      </TouchableOpacity>
    </View>
  );
};

export default ChatPanicButton;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
