import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { generateURL } from "@/utils/image-utils.utils";
import { router } from "expo-router";
import { ArrowLeft2, Call, Video } from "iconsax-react-native";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { ChatMessage } from "@/types/chat.types";
import { useUserStore } from "@/store/store";

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
  const theme = useTheme();
  const { user } = useUserStore();

  const imageSource =
    imageError || !profileUrl
      ? require("@/assets/user.png")
      : { uri: generateURL({ url: profileUrl }) };

  // Generate a deterministic 1:1 call ID
  const generateCallId = (userId: string, recipientId: string) => {
    return [userId, recipientId].sort().join("-");
  };
  

  const callId = generateCallId(user?.id || "", recipientId || "");

  const handleCallPress = () => {
    if (!callId) return;
    router.push(`/outgoing-call?id=${callId}`);
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
              {new Date(message.updated_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>

      {/* Right: Call & Video */}
      <ThemedView flexDirection="row" alignItems="center" gap={10}>
        <TouchableOpacity onPress={handleCallPress}>
          <Call color={COLORS.primary} size={28} variant="Broken" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCallPress}>
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
    backgroundColor: "#ddd",
  },
});
