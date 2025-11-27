import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { generateURL } from "@/utils/image-utils.utils";
import { Href, router } from "expo-router";
import { ArrowLeft2, Call, Video } from "iconsax-react-native";
import { Image, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { ChatMessage } from "@/types/chat.types";
import { formatDistanceToNow } from "date-fns";
import { useCall } from "@/context/call-provider";
import { useUserStore } from "@/store/store";
import { requestMicrophonePermission, requestCallPermissions } from "@/utils/permissions-utils.utils";
import { toast } from "@/components/lib/toast-manager";

export const HeaderChat = ({
  profileUrl,
  name,
  message,
  recipientId,
}: {
  name?: string;
  profileUrl: string;
  message: ChatMessage;
  recipientId?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  const imageSource =
    imageError || !profileUrl
      ? require("@/assets/user.png")
      : { uri: generateURL({ url: profileUrl }) };

  const theme = useTheme();

  const { client, createCall } = useCall();
  const { user } = useUserStore();
  
  const handleVoiceCall = async () => {
    try {
      if (!client) {
        console.error("Call client not initialized");
        toast.error("Call service not ready yet");
        return;
      }

      if (!recipientId) {
        toast.error("Recipient information not available");
        return;
      }

      // Try to request microphone permission first
      // If it fails, proceed anyway - WebRTC will handle it
      try {
        await requestMicrophonePermission(false); // Don't block if it fails
      } catch (error) {
        console.log("Permission request failed, proceeding anyway:", error);
      }

      console.log(`Attempting to start audio call with ${recipientId}`);

      // Create audio call
      const call = await createCall(recipientId, "audio");

      if (call) {
        console.log("Audio call initiated with:", name);
        // Navigate to outgoing call screen first
        router.push(`/outgoing-call?recipientId=${recipientId}&callType=audio&callId=${call.id}` as Href);
      } else {
        console.error("Failed to create call - call object is null");
        toast.error("Unable to connect call. Please try again later.");
      }
    } catch (error) {
      console.error("Failed to start audio call:", error);
      toast.error("An error occurred while trying to make the call");
    }
  };
  
  const handleVideoCall = async () => {
    try {
      if (!client) {
        toast.error("Video call service not available");
        return;
      }

      if (!recipientId) {
        toast.error("Recipient information not available");
        return;
      }

      // Try to request camera and microphone permissions first
      // If it fails, proceed anyway - WebRTC will handle it
      try {
        await requestCallPermissions(false); // Don't block if it fails
      } catch (error) {
        console.log("Permission request failed, proceeding anyway:", error);
      }
      
      console.log(`Attempting to start video call with ${recipientId}`);
      
      // Create video call
      const call = await createCall(recipientId, "video");

      if (call) {
        console.log("Video call initiated with:", name);
        // Navigate to outgoing call screen first
        router.push(`/outgoing-call?recipientId=${recipientId}&callType=video&callId=${call.id}` as Href);
      } else {
        console.error("Failed to create video call - call object is null");
        toast.error("Could not start video call. Please try again.");
      }
    } catch (error) {
      console.error("Failed to initiate video call:", error);
      toast.error("Could not start video call. Please try again.");
    }
  };
  return (
    <ThemedView
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={12}
      paddingVertical={10}
      borderBottomWidth={0.2}
      borderBottomLeftRadius={20}
      borderBottomRightRadius={20}
      borderBottomColor="#eee"
      // backgroundColor="#fff"
    >
      {/* Left: Back + User Info */}
      <ThemedView flexDirection="row" alignItems="center" flexShrink={1}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 10 }}
        >
          <ArrowLeft2 size={28} color={theme.colors.text} />
        </TouchableOpacity>

        <Image
          source={imageSource}
          onError={() => setImageError(true)}
          style={styles.userImage}
        />

        <ThemedView marginLeft={10}>
          <ThemedText fontSize={16} fontWeight="600">
            {name || "Unknown User"}
          </ThemedText>
          {message?.updated_at && (
            <ThemedText fontSize={12} color="#666">
              Last seen{" "}
              {message?.updated_at &&
                new Date(message?.updated_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>

      {/* Right: Call & Video */}
      <ThemedView flexDirection="row" alignItems="center" gap={10}>
        <TouchableOpacity onPress={handleVoiceCall}>
          <Call color={COLORS.primary} size={28} variant="Broken" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleVideoCall}>
          <Video color={COLORS.primary} size={28} variant="Broken" />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd", // optional placeholder background
  },
});
