import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCall as useStreamCall, CallingState } from "@stream-io/video-react-native-sdk";
import { router } from "expo-router";
import { Call, CallSlash } from "iconsax-react-native";
import { COLORS } from "@/config/theme";
import { generateURL } from "@/utils/image-utils.utils";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { useUserStore } from "@/store/store";
import { requestMicrophonePermission, requestCallPermissions } from "@/utils/permissions-utils.utils";
import { toast } from "@/components/lib/toast-manager";

export const IncomingCallScreen = () => {
  const call = useStreamCall();
  const [pulseAnim] = useState(new Animated.Value(1));
  const { user } = useUserStore();

  // Get call type from custom data
  const callType = call?.custom?.type || "audio";
  const isAudioCall = callType === "audio";
  const callerId = call?.createdBy?.id;
  const callerName = call?.createdBy?.name || "Unknown";

  // Pulse animation for incoming call
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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

  const handleAccept = async () => {
    try {
      if (!call) return;

      // Try to request permissions before accepting the call
      // If permission requests fail (native modules not available), we'll proceed anyway
      // WebRTC SDK will handle permissions when it actually needs them
      try {
        if (isAudioCall) {
          await requestMicrophonePermission(false); // Don't show alert if it fails
        } else {
          // For video calls, request both camera and microphone
          await requestCallPermissions(false); // Don't show alert if it fails
        }
        // Small delay to ensure permissions are fully processed
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (permError) {
        console.log("Permission request failed, proceeding anyway - WebRTC will handle it:", permError);
        // Continue anyway - WebRTC SDK will request permissions when needed
      }

      await call.join(); // Use join instead of accept for better compatibility
      // Wait a moment for call to be joined, then navigate
      setTimeout(() => {
        router.replace(`/video-call?channel=${call.id}&callType=${callType}`);
      }, 500);
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Failed to accept call");
    }
  };

  const handleReject = async () => {
    try {
      if (!call) return;
      await call.reject();
      // Call will be automatically cleaned up
    } catch (error) {
      console.error("Error rejecting call:", error);
    }
  };

  if (!call) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Caller Avatar */}
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
                call.createdBy?.image
                  ? { uri: generateURL({ url: call.createdBy.image }) }
                  : require("@/assets/user.png")
              }
              defaultSource={require("@/assets/user.png")}
              style={styles.avatar}
            />
          </View>
        </Animated.View>

        {/* Caller Info */}
        <ThemedText fontSize={28} weight="bold" color="#fff" marginTop={30}>
          {callerName}
        </ThemedText>
        <ThemedText fontSize={18} color="#ccc" marginTop={10}>
          {isAudioCall ? "Incoming Audio Call" : "Incoming Video Call"}
        </ThemedText>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
          >
            <CallSlash size={32} color="#fff" variant="Bold" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
          >
            <Call size={32} color="#fff" variant="Bold" />
          </TouchableOpacity>
        </View>
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
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 60,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#FF3B30",
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
});

