import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useInitiatePanicButton } from "@/hooks/auth-hooks.hooks";
import { ThemedText } from "@/components/ui/themed-view";

type ProfileMenuProps = {
  visible: boolean;
  onClose: () => void;
};

const ITEMS: Array<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Href;
}> = [
  { label: "Friends", icon: "people-outline", href: "/(home)/friends" },
  { label: "Wallet", icon: "wallet-outline", href: "/(settings)/wallet" },
  { label: "Gift shop", icon: "gift-outline", href: "/(settings)/wallet" },
  { label: "Settings and activity", icon: "settings-outline", href: "/settings" },
];

export default function ProfileMenu({ visible, onClose }: ProfileMenuProps) {
  const [sendingSos, setSendingSos] = useState(false);

  const navigate = (href: Href) => {
    onClose();
    requestAnimationFrame(() => router.push(href));
  };

  const sendSos = async () => {
    if (sendingSos) return;
    setSendingSos(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Location required",
          "Enable location access to send your SOS with your current position."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const response = await useInitiatePanicButton({
        data: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          reason: "I need help",
        },
      });
      const message = response?.data?.message;
      if (
        message?.toLowerCase().includes("missing emergency contact") ||
        message?.toLowerCase().includes("not sent")
      ) {
        Alert.alert(
          "Emergency contact required",
          "Add an emergency contact email in Edit profile, then try again."
        );
        return;
      }
      if (!response?.success) {
        Alert.alert("SOS failed", message || "Unable to send your alert.");
        return;
      }
      Alert.alert("SOS sent", message || "Your emergency alert was sent.");
      onClose();
    } catch {
      Alert.alert("SOS failed", "Unable to send your alert. Please try again.");
    } finally {
      setSendingSos(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.row}
              onPress={() => navigate(item.href)}
            >
              <Ionicons name={item.icon} size={25} color="#262626" />
              <ThemedText style={styles.label}>{item.label}</ThemedText>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.row} onPress={sendSos}>
            {sendingSos ? (
              <ActivityIndicator size="small" color="#ED4956" />
            ) : (
              <Ionicons name="warning-outline" size={25} color="#ED4956" />
            )}
            <ThemedText style={styles.sosLabel}>Panic / SOS</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
    paddingBottom: 28,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#c7c7c7",
    alignSelf: "center",
    marginBottom: 10,
  },
  row: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
  },
  label: {
    color: "#262626",
    fontSize: 16,
  },
  sosLabel: {
    color: "#ED4956",
    fontSize: 16,
    fontWeight: "600",
  },
});
