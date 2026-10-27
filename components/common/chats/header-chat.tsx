import { ThemedText } from "@/components/ui/themed-view";
import { generateURL } from "@/utils/image-utils.utils";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRef, useState } from "react";
import { ChatMessage } from "@/types/chat.types";
import { useUserStore } from "@/store/store";
import toast from "@/components/lib/toast-manager";
import { getChatSocket } from "@/services/chat-socket.service";
import { Ionicons } from "@expo/vector-icons";

export const HeaderChat = ({
  profileUrl,
  name,
  message,
  recipientId,
  chatId,
}: {
  name?: string;
  profileUrl: string;
  message?: ChatMessage;
  recipientId?: string;
  chatId?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const { user } = useUserStore();
  const startingCallRef = useRef(false);

  const imageSource =
    imageError || !profileUrl
      ? require("@/assets/user.png")
      : { uri: generateURL({ url: profileUrl }) };

  const generateCallId = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (value) => {
      const random = Math.floor(Math.random() * 16);
      const digit = value === "x" ? random : (random & 0x3) | 0x8;
      return digit.toString(16);
    });

  const handleCallPress = async (callType: "audio" | "video") => {
    if (!recipientId || startingCallRef.current) return;
    startingCallRef.current = true;
    const sock = await getChatSocket();
    if (!sock?.connected) {
      startingCallRef.current = false;
      toast.show({
        title: "Not connected to chat server.",
        type: "error",
        duration: 2000,
      });
      return;
    }

    const callId = generateCallId();
    sock.emit("call", {
      toUserId: recipientId,
      fromUserId: user?.id,
      callId,
      callType,
      chatId,
    });
    router.push({
      pathname: "/outgoing-call",
      params: {
        id: callId,
        recipientId,
        mode: "create",
        chatId,
        profileUrl,
        name,
        callType,
      },
    } as any);
    startingCallRef.current = false;
  };

  const openProfile = () => {
    if (!recipientId) return;
    router.push(`/(friends)/view-friends?id=${recipientId}`);
  };

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color="#262626" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.user}
          activeOpacity={0.7}
          onPress={openProfile}
        >
          <Image
            source={imageSource}
            onError={() => setImageError(true)}
            style={styles.avatar}
          />
          <View style={styles.meta}>
            <Text style={styles.name} numberOfLines={1}>
              {name || "Unknown"}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {message?.updated_at
                ? `Active ${new Date(message.updated_at).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}`
                : "Instagram"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => handleCallPress("audio")}
          hitSlop={8}
          style={styles.actionBtn}
        >
          <Ionicons name="call-outline" size={24} color="#262626" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleCallPress("video")}
          hitSlop={8}
          style={styles.actionBtn}
        >
          <Ionicons name="videocam-outline" size={26} color="#262626" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#dbdbdb",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  back: {
    width: 36,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  user: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#efefef",
  },
  meta: {
    flexShrink: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#262626",
  },
  subtitle: {
    fontSize: 12,
    color: "#8e8e8e",
    marginTop: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingRight: 8,
  },
  actionBtn: {
    padding: 2,
  },
});
