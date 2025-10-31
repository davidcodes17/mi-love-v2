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

export const HeaderChat = ({
  profileUrl,
  name,
  message,
}: {
  name?: string;
  profileUrl: string;
  message: ChatMessage;
}) => {
  const [imageError, setImageError] = useState(false);

  const imageSource =
    imageError || !profileUrl
      ? require("@/assets/users.jpg")
      : { uri: generateURL({ url: profileUrl }) };

  const theme = useTheme();

  const { client, createCall } = useCall();
  const { user } = useUserStore();
  const handleVoiceCall = async () => {
    try {
      if (!client) {
        console.error("Call client not initialized");
        Alert.alert("Error", "Call service not ready yet");
        return;
      }

      // Use the createCall method from our context
      // For testing, we'll use the opposite user ID (if we're user1, call user2 and vice versa)
      const recipientId = user?.username === "areegbedavid" ? "user2" : "user1";
      console.log(`Attempting to call ${recipientId} from ${user?.username}`);
      
      // Show calling indicator
      Alert.alert("Calling...", `Starting call with ${name || "user"}`);
      
      const call = await createCall(recipientId, "default");

      if (call) {
        console.log("Voice call initiated with:", name);
      } else {
        console.error("Failed to create call - call object is null");
        Alert.alert("Call Failed", "Unable to connect call. Please try again later.");
      }
    } catch (error) {
      console.error("Failed to start voice call:", error);
      Alert.alert("Call Error", "An error occurred while trying to make the call");
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
        <TouchableOpacity
          onPress={async () => {
            try {
              if (!client) {
                Alert.alert("Error", "Video call service not available");
                return;
              }
              
              // Generate a unique call ID
              const callId = `video-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
              
              // Show calling indicator
              Alert.alert("Starting Video Call", `Connecting to ${name || "user"}`);
              
              // Get the opposite user ID for the call
              const recipientId = user?.username === "areegbedavid" ? "user2" : "user1";
              
              // Create the call first
              const call = client.call("default", callId);
              await call.getOrCreate({
                data: {
                  members: [{ user_id: recipientId }],
                  custom: { type: "video" }
                }
              });
              
              // Navigate to video call screen
              router.push(`/video-call?channel=${callId}` as Href);
            } catch (error) {
              console.error("Failed to initiate video call:", error);
              Alert.alert("Video Call Failed", "Could not start video call. Please try again.");
            }
          }}
        >
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
