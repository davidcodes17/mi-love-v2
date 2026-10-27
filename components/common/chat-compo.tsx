import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Chat, Message, User } from "@/types/chat.types";
import { generateURL } from "@/utils/image-utils.utils";
import { useUserStore } from "@/store/store";

interface ChatCompoProps {
  chat: Chat;
  currentUserId: string;
}

const formatRelative = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const previewText = (lastMessage?: Message) => {
  if (!lastMessage) return "No messages yet";
  if (lastMessage.type === "call" || lastMessage.type === "video-call") {
    const video = lastMessage.type === "video-call";
    const content = lastMessage.content?.toLowerCase() || "";
    if (content.includes("missed")) return video ? "Missed video call" : "Missed call";
    return video ? "Video call" : "Voice call";
  }
  if (lastMessage.type === "announcement") {
    return lastMessage.content || "Update";
  }
  if (lastMessage.content) return lastMessage.content;
  if (lastMessage.file?.url) return "Sent an attachment";
  return "No messages yet";
};

const ChatCompo: React.FC<ChatCompoProps> = ({ chat, currentUserId }) => {
  const [imageError, setImageError] = useState(false);
  const { user } = useUserStore();
  const isGroup =
    chat.type === "group" ||
    chat.isGroup === true ||
    chat.participants.length > 2;

  const otherParticipant = chat.participants.find((p) => p.userId !== user?.id)
    ?.user as User | undefined;

  const displayName = isGroup
    ? chat.name || "Group chat"
    : otherParticipant?.username ||
      (otherParticipant
        ? `${otherParticipant.first_name} ${otherParticipant.last_name}`.trim()
        : "Unknown");

  const displayImage = isGroup
    ? chat.image?.url
    : otherParticipant?.profile_picture?.url;

  const lastMessage: Message | undefined =
    chat.messages.length > 0
      ? chat.messages[chat.messages.length - 1]
      : undefined;

  const unreadCount = chat.messages.filter(
    (msg: any) => msg.userId !== currentUserId && !msg.deleted && !msg.read
  ).length;

  const hasUnread = unreadCount > 0;
  const preview = previewText(lastMessage);

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      onPress={() => {
        router.push({
          pathname: "/(chats)/chats",
          params: {
            chatId: chat.id,
            recipientId: isGroup ? undefined : otherParticipant?.id,
            profileUrl: displayImage,
            name: displayName,
          },
        });
      }}
      style={styles.row}
    >
      <Image
        source={
          imageError || !displayImage
            ? require("@/assets/user.png")
            : { uri: generateURL({ url: displayImage }) }
        }
        onError={() => setImageError(true)}
        defaultSource={require("@/assets/user.png")}
        style={styles.avatar}
      />

      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text
            style={[styles.name, hasUnread && styles.nameUnread]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text style={styles.time}>{formatRelative(lastMessage?.created_at)}</Text>
        </View>
        <View style={styles.bottomLine}>
          <Text
            style={[styles.preview, hasUnread && styles.previewUnread]}
            numberOfLines={1}
          >
            {preview}
          </Text>
          {hasUnread ? <View style={styles.unreadDot} /> : null}
        </View>
      </View>

      <TouchableOpacity
        hitSlop={10}
        style={styles.cameraBtn}
        onPress={() => {
          router.push({
            pathname: "/(chats)/chats",
            params: {
              chatId: chat.id,
              recipientId: isGroup ? undefined : otherParticipant?.id,
              profileUrl: displayImage,
              name: displayName,
            },
          });
        }}
      >
        <Ionicons name="camera-outline" size={24} color="#262626" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default ChatCompo;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 72,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#efefef",
    marginRight: 12,
  },
  body: {
    flex: 1,
    paddingRight: 8,
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  name: {
    flex: 1,
    fontSize: 14,
    color: "#262626",
    fontWeight: "400",
    marginRight: 8,
  },
  nameUnread: {
    fontWeight: "700",
  },
  time: {
    fontSize: 12,
    color: "#8e8e8e",
  },
  bottomLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  preview: {
    flex: 1,
    fontSize: 14,
    color: "#8e8e8e",
    marginRight: 8,
  },
  previewUnread: {
    color: "#262626",
    fontWeight: "600",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0095f6",
  },
  cameraBtn: {
    paddingLeft: 6,
    paddingVertical: 8,
  },
});
