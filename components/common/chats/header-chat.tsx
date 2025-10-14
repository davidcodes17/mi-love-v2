import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { generateURL } from "@/utils/image-utils.utils";
import { Href, router } from "expo-router";
import { ArrowLeft2, Call, Video } from "iconsax-react-native";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useState } from "react";

export const HeaderChat = ({
  profileUrl,
  name,
}: {
  name?: string;
  profileUrl: string;
}) => {
  const [imageError, setImageError] = useState(false);

  const imageSource = imageError || !profileUrl
    ? require("@/assets/users.jpg")
    : { uri: generateURL({ url: profileUrl }) };

  return (
    <ThemedView
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={12}
      paddingVertical={10}
      borderBottomWidth={1}
      borderBottomColor="#eee"
      backgroundColor="#fff"
    >
      {/* Left: Back + User Info */}
      <ThemedView flexDirection="row" alignItems="center" flexShrink={1}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 10 }}
        >
          <ArrowLeft2 size={28} color="#000" />
        </TouchableOpacity>

        <Image
          source={imageSource}
          onError={() => setImageError(true)}
          style={styles.userImage}
        />

        <ThemedView marginLeft={10}>
          <ThemedText fontSize={16} fontWeight="600" color="#000">
            {name || "Unknown User"}
          </ThemedText>
          <ThemedText fontSize={12} color="#666">
            Last seen 2 mins ago
          </ThemedText>
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
