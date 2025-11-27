import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CallSlash } from "iconsax-react-native";
import { COLORS } from "@/config/theme";
import { generateURL } from "@/utils/image-utils.utils";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import type { Call } from "@stream-io/video-react-native-sdk";

interface OutgoingCallScreenProps {
  call: Call | null;
  recipientName?: string;
  recipientImage?: string;
  callType: "audio" | "video";
  onCancel: () => void;
}

export const OutgoingCallScreen = ({
  call,
  recipientName = "Unknown",
  recipientImage,
  callType,
  onCancel,
}: OutgoingCallScreenProps) => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const isAudioCall = callType === "audio";

  // Pulse animation for outgoing call
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleCancel = async () => {
    try {
      if (call) {
        await call.leave();
      }
    } catch (error) {
      console.error("Error canceling call:", error);
    } finally {
      onCancel();
    }
  };

  // Show loading if call is not available
  if (!call) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <ThemedText fontSize={18} color="#ccc" marginTop={20}>
            Connecting...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Recipient Avatar */}
        <Animated.View
          style={[
            styles.avatarContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.avatarRing}>
            <Image
              source={
                recipientImage
                  ? { uri: generateURL({ url: recipientImage }) }
                  : require("@/assets/user.png")
              }
              defaultSource={require("@/assets/user.png")}
              style={styles.avatar}
            />
          </View>
        </Animated.View>

        {/* Recipient Info */}
        <ThemedText fontSize={28} weight="bold" color="#fff" marginTop={30}>
          {recipientName}
        </ThemedText>
        <ThemedText fontSize={18} color="#ccc" marginTop={10}>
          {isAudioCall ? "Calling..." : "Video calling..."}
        </ThemedText>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <CallSlash size={32} color="#fff" variant="Bold" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: COLORS.primary,
    padding: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
  },
  loadingContainer: {
    marginTop: 40,
  },
  cancelButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
});

