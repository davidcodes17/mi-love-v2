import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  View,
} from "react-native";
import { Add, Alarm, Gift, Send2 } from "iconsax-react-native";
import { useLocalSearchParams } from "expo-router";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { ChatMessage } from "@/types/chat.types";
import { HeaderChat } from "@/components/common/chats/header-chat";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGetChatsPerFriend } from "@/hooks/chats.hooks";
import ChatPanicButton from "@/components/common/chats/panic-button-icon";
import { toast } from "@/components/lib/toast-manager";
import NativeButton from "@/components/ui/native-button";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

/* ---------------- Main Chats Component ---------------- */
const Chats = () => {
  const { chatId, name, profileUrl, userId } = useLocalSearchParams<{
    chatId: string;
    userId: string;
    profileUrl: string;
    name?: string;
  }>();

  const currentUserId = userId;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  /* Fetch messages from API */
  const fetchMessages = async () => {
    const response = await useGetChatsPerFriend({ id: chatId });
    setMessages(response?.data || []);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  /* Setup socket connection */
  useEffect(() => {
    const setupSocket = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const socket = io("https://ttznxdxb-9999.uks1.devtunnels.ms/chat", {
        transports: ["websocket"],
        extraHeaders: { Authorization: `Bearer ${token}` },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ Connected to chat server:", socket.id);
      });

      socket.on("error", (data) => {
        toast.show({
          title: data?.message || "An error occurred",
          type: "error",
          duration: 2000,
        });
        console.log("⚠️ Socket error:", data);
        fetchMessages();
      });

      socket.on("connect_error", (err) => {
        console.log("❌ Connection error:", err.message);
      });

      socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected:", reason);
      });

      socket.on("private-message", (data) => {
        console.log("📩 New message:", data);
        setMessages((prev) => [
          ...prev,
          { ...data, id: Date.now().toString() },
        ]);
      });
    };

    setupSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  /* Handle sending */
  const handleSend = (msg: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit(
      "private-message",
      {
        toUserId: userId,
        message: msg,
      },
      (response: { status: string; message?: string }) => {
        if (response.status === "ok") {
          console.log("✅ Message delivered successfully!");
        } else {
          console.log("❌ Message failed:", response.message);
        }
      }
    );

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "text",
        content: msg,
        edited: false,
        deleted: false,
        fileId: null,
        userId: currentUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        chatId,
        user: null,
        file: null,
      },
    ]);
  };

  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderChat profileUrl={profileUrl} name={name} />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => (
          <MessageBubble item={item} currentUserId={currentUserId} />
        )}
      />

      <NativeButton mode="fill" text={"Open"} />
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
      >
        <BottomSheetView style={styles.contentContainer}>
          <ThemedText>Awesome 🎉</ThemedText>
        </BottomSheetView>
      </BottomSheet>
      <ChatInput onSend={handleSend} />
    </SafeAreaView>
  );
};

/* ---------------- Message Bubble ---------------- */
const MessageBubble = ({
  item,
  currentUserId,
}: {
  item: ChatMessage;
  currentUserId: string;
}) => {
  const isMe = item.userId === currentUserId;

  // 🎯 Render announcement differently
  if (item.type === "announcement") {
    return (
      <ThemedView
        padding={12}
        marginVertical={6}
        marginHorizontal={30}
        borderRadius={12}
        backgroundColor={COLORS.primary + "20"}
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap={8}
      >
        <Alarm size={18} color={COLORS.primary} variant="Bold" />
        <ThemedText
          fontSize={14}
          textAlign="center"
          color={COLORS.primary}
          fontWeight="600"
        >
          {item.content}
        </ThemedText>
      </ThemedView>
    );
  }

  // 🗨️ Normal message bubble
  return (
    <View
      style={[
        styles.messageBubble,
        isMe ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <ThemedText color={isMe ? "#fff" : "#000"}>{item.content}</ThemedText>
    </View>
  );
};

/* ---------------- Chat Input ---------------- */
const ChatInput = ({ onSend }: { onSend: (msg: string) => void }) => {
  const [text, setText] = useState("");

  const handlePress = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <ThemedView
      flexDirection="row"
      alignItems="center"
      padding={10}
      paddingVertical={20}
      position="absolute"
      bottom={0}
      borderTopWidth={0.3}
      borderTopColor="#eee"
      backgroundColor="#fafafa"
      gap={10}
    >
      <ChatPanicButton />

      <TextInput
        placeholder="Type a message..."
        placeholderTextColor="#888"
        value={text}
        onChangeText={setText}
        style={styles.textInput}
      />

      <TouchableOpacity style={styles.sendButton} onPress={handlePress}>
        <Gift size={20} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.sendButton} onPress={handlePress}>
        <Send2 size={20} color="#fff" />
      </TouchableOpacity>
    </ThemedView>
  );
};

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  messagesList: { padding: 16, paddingBottom: 100 },

  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "80%",
  },
  myMessage: { alignSelf: "flex-end", backgroundColor: COLORS.primary },
  otherMessage: { alignSelf: "flex-start", backgroundColor: "#eee" },

  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 200,
    color: "#000",
    backgroundColor: "#fff",
    fontFamily: "Quicksand_500Medium",
    borderWidth: 0.3,
    borderColor: "#ddd",
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 400,
  },
   contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  }
});

export default Chats;
