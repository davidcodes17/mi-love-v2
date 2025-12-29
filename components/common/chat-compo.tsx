import { Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import ThemedView, { ThemedText } from "../ui/themed-view";
import { COLORS } from "@/config/theme";
import { router } from "expo-router";
import { Chat, Message, User } from "@/types/chat.types";
import { generateURL } from "@/utils/image-utils.utils";
import { useUserStore } from "@/store/store";
// <- adjust path to your interfaces

// Props interface
interface ChatCompoProps {
  chat: Chat;
  currentUserId: string; // to know who has read/unread
}

const ChatCompo: React.FC<ChatCompoProps> = ({ chat, currentUserId }) => {
  const [imageError, setImageError] = useState(false);
  const { user, updateUser, clearUser } = useUserStore();

  // find other participant (not the current user)
  const otherParticipant = chat.participants.find((p) => p.userId !== user?.id)
    ?.user as User | undefined;

  // get last message
  const lastMessage: Message | undefined =
    chat.messages.length > 0
      ? chat.messages[chat.messages.length - 1]
      : undefined;

  // get unread count (example logic: messages not sent by current user)
  const unreadCount = chat.messages.filter(
    (msg: any) => msg.userId !== currentUserId && !msg.deleted
  ).length;

  return (
    <TouchableOpacity
      onPress={() => {
        console.log(chat?.id, "PWPPW");
        router.push({
          pathname: "/(chats)/chats", // route
          params: {
            chatId: chat.id,
            userId: otherParticipant?.id,
            profileUrl: otherParticipant?.profile_picture?.url,
            name: `${otherParticipant?.first_name} ${otherParticipant?.last_name}`,
          },
        });
      }}
      style={{ flex: 1 }}
    >
      <ThemedView
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        borderBottomWidth={1}
        borderColor={"#ddd"}
        paddingVertical={20}
      >
        {/* Left side: Avatar + Name + Last Message */}
        <ThemedView flexDirection="row" alignItems="center" gap={10}>
          <Image
            source={
              imageError || !otherParticipant?.profile_picture?.url
                ? require("@/assets/user.png")
                : {
                  uri: generateURL({
                    url: otherParticipant.profile_picture.url,
                  }),
                }
            }
            onError={() => setImageError(true)}
            defaultSource={require("@/assets/user.png")}
            style={{
              width: 45,
              height: 45,
              borderRadius: 200,
            }}
            resizeMode="cover"
          />
          <ThemedView>
            <ThemedText fontSize={15} weight="semibold">
              {otherParticipant
                ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
                : "Unknown User"}
            </ThemedText>
            <ThemedText numberOfLines={1} fontSize={12} ellipsizeMode="tail">
              {
                //@ts-ignore
                (() => {
                  // Check if it's a call type message
                  if (lastMessage?.type === "call" || lastMessage?.type === "video-call") {
                    const isVideoCall = lastMessage?.type === "video-call";
                    const content = lastMessage?.content?.toLowerCase() || "";
                    const isMissedCall = content.includes("missed");
                    const isIncoming = content.includes("incoming");
                    const isOutgoing = content.includes("outgoing") || content.includes("initiated");
                    
                    const callType = isVideoCall ? "📹 Video call" : "📞 Voice call";
                    const callStatus = isMissedCall ? " - Missed" : isIncoming ? " - Incoming" : isOutgoing ? " - Outgoing" : "";
                    return `${callType}${callStatus}`;
                  }
                  
                  // Check if it's an announcement that mentions a call
                  if (lastMessage?.type === "announcement") {
                    const content = lastMessage?.content?.toLowerCase() || "";
                    if (content.includes("call")) {
                      // Extract call info from announcement
                      const isVideoCall = content.includes("video");
                      const isMissedCall = content.includes("missed");
                      const isIncoming = content.includes("incoming");
                      const isOutgoing = content.includes("outgoing") || content.includes("initiated");
                      
                      const callType = isVideoCall ? "📹 Video call" : "📞 Voice call";
                      const callStatus = isMissedCall ? " - Missed" : isIncoming ? " - Incoming" : isOutgoing ? " - Outgoing" : "";
                      return `${callType}${callStatus}`;
                    }
                    // Other announcements just show content
                    return lastMessage?.content;
                  }
                  
                  // Regular text messages
                  if (lastMessage?.content) {
                    return lastMessage?.content;
                  }
                  
                  // Image attachment
                  if (lastMessage?.file?.url &&
                    ["jpg", "jpeg", "png", "svg"].some(ext =>
                      lastMessage?.file?.url.toLowerCase().endsWith(ext)
                    )
                  ) {
                    return "🖼️ Image Shared";
                  }
                  
                  return "No messages yet";
                })()
              }

            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Right side: Time + Unread badge */}
        <ThemedView alignItems="flex-end">
          <ThemedText>
            {lastMessage
              ? new Date(lastMessage.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
              : ""}
          </ThemedText>

          {unreadCount > 0 && (
            <ThemedView
              justifyContent="center"
              flexDirection="row"
              marginTop={2}
            >
              <ThemedText
                width={20}
                height={20}
                backgroundColor={COLORS.primary}
                borderRadius={200}
                textAlign="center"
                paddingTop={4}
                fontSize={10}
                color={"#fff"}
              >
                {unreadCount}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default ChatCompo;
