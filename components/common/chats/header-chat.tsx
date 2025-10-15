import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { generateURL } from "@/utils/image-utils.utils";
import { Href, router } from "expo-router";
import { ArrowLeft2, Call, Video } from "iconsax-react-native";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { ChatMessage } from "@/types/chat.types";
import { formatDistanceToNow } from "date-fns";

export const HeaderChat = ({
  profileUrl,
  name,
  message
}: {
  name?: string;
  profileUrl: string;
  message: ChatMessage
}) => {
  const [imageError, setImageError] = useState(false);

  const imageSource = imageError || !profileUrl
    ? require("@/assets/users.jpg")
    : { uri: generateURL({ url: profileUrl }) };

  const theme = useTheme()

  return (
    <ThemedView
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={12}
      paddingVertical={10}
      borderBottomWidth={.2}
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
          {
            message?.updated_at &&
            <ThemedText fontSize={12} color="#666">
              Last seen {message?.updated_at && new Date(message?.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', })}
            </ThemedText>
          }
        </ThemedView>
      </ThemedView>

      {/* Right: Call & Video */}
      <ThemedView flexDirection="row" alignItems="center" gap={10}>
        <TouchableOpacity onPress={() => router.push("/(chats)/call" as Href)}>
          <Call color={COLORS.primary} size={28} variant="Broken" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const channelId = "chatroom123";
            router.push(`/video-call?channel=${channelId}` as Href);
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
