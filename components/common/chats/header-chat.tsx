import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { generateURL } from "@/utils/image-utils.utils";
import { router } from "expo-router";
import { ArrowLeft2, Call, Video } from "iconsax-react-native";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { ChatMessage } from "@/types/chat.types";
import { useGetTokenCall } from "@/hooks/chats.hooks";
import { useCallStore } from "@/store/call.store";

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
  const [token, setToken] = useState<string | null>(null);

  const theme = useTheme();
  const setCall = useCallStore((state) => state.setCall);

  /** IMAGE SOURCE LOGIC */
  const imageSource =
    imageError || !profileUrl
      ? require("@/assets/users.jpg")
      : { uri: generateURL({ url: profileUrl }) };

  /** ---------- FETCH CALL TOKEN ---------- */
  const handleGenerateToken = async () => {
    try {
      const response = await useGetTokenCall();

      if (response?.token) {
        setToken(response.token);
        console.log("CALL TOKEN GENERATED:", response.token);
      } else {
        console.warn("Token missing in response");
      }
    } catch (error) {
      console.error("Error generating call token:", error);
    }
  };

  useEffect(() => {
    handleGenerateToken();
  }, []);

  /** ---------- START CALL ---------- */
  const startCall = (type: "audio" | "video") => {
    if (!token) {
      console.warn("No call token yet — cannot start call");
      return;
    }

    setCall({
      type,
      callId: message.chatId, // <--- FIXED callId
      caller: { name: "Me" },
      callee: { name },
      token,
    });

    router.push("/(chats)/call-outgoing" as any);
  };

  return (
    <ThemedView
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={12}
      paddingVertical={10}
      borderBottomWidth={0.2}
      borderBottomColor="#eee"
      borderBottomLeftRadius={20}
      borderBottomRightRadius={20}
    >
      {/* ---------- LEFT: BACK + USER INFO ---------- */}
      <ThemedView flexDirection="row" alignItems="center" flexShrink={1}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
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

      {/* ---------- RIGHT: CALL BUTTONS ---------- */}
      <ThemedView flexDirection="row" alignItems="center" gap={10}>
        <TouchableOpacity onPress={() => startCall("audio")}>
          <Call color={COLORS.primary} size={28} variant="Broken" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => startCall("video")}>
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
