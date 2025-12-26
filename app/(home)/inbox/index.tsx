import ChatCompo from "@/components/common/chat-compo";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { useGetAllChats } from "@/hooks/chats.hooks";
import { useUserStore } from "@/store/store";
import { Chat, ChatResponse, Message as ChatMessageType } from "@/types/chat.types";
import { Message } from "iconsax-react-native";
import { useCallback, useEffect, useState, useRef } from "react";
import { FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Page() {
  const [data, setData] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const fetchChatsRef = useRef<((showMainLoader?: boolean) => Promise<void>) | null>(null);
  const connectionErrorCountRef = useRef(0);
  const maxConnectionAttempts = 3;

  const { user } = useUserStore();

  const fetchChats = useCallback(async (showMainLoader = true) => {
    try {
      if (showMainLoader) setLoading(true);
      const response = await useGetAllChats();
      setData(response);
    } catch (error) {
      console.error("❌ Failed to fetch chats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Store fetchChats in ref for socket handler
  useEffect(() => {
    fetchChatsRef.current = fetchChats;
  }, [fetchChats]);

  // ✅ Fetch once on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // ✅ Re-fetch every time the page regains focus
  useFocusEffect(
    useCallback(() => {
      fetchChats(false); // no main loader, just refresh silently
    }, [])
  );

  // ✅ Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChats(false);
  }, []);

  // ✅ Setup socket connection for real-time message updates
  useEffect(() => {
    if (!user?.id) {
      console.log("Inbox: Waiting for user data...");
      return;
    }

    let mounted = true;

    const setupSocket = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.warn("⚠️ Inbox: No token available for socket connection");
          return;
        }

        // Use the same base URL as the API
        const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://z91gp9m2-9999.uks1.devtunnels.ms';
        
        console.log("🔌 Inbox: Attempting socket connection to:", API_BASE_URL);

        const socket = io(API_BASE_URL, {
          transports: ["websocket"],
          auth: {
            token: `Bearer ${token}`,
          },
          query: {
            userId: user?.id || "",
          },
          reconnectionAttempts: maxConnectionAttempts,
          reconnectionDelay: 2000,
          reconnectionDelayMax: 5000,
          timeout: 10000,
          autoConnect: true,
          forceNew: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("✅ Inbox: Connected to chat server:", socket.id);
          connectionErrorCountRef.current = 0; // Reset error count on successful connection
        });

        socket.on("disconnect", (reason) => {
          console.log("❌ Inbox: Disconnected from chat server:", reason);
          if (reason === "io server disconnect") {
            // Server disconnected, attempt reconnect if under limit
            if (connectionErrorCountRef.current < maxConnectionAttempts) {
              socket?.connect();
            }
          }
        });

        socket.on("connect_error", (error) => {
          connectionErrorCountRef.current++;
          
          // Only log first few errors to avoid spam
          if (connectionErrorCountRef.current <= maxConnectionAttempts) {
            console.error(`🔴 Inbox: Socket connection error (${connectionErrorCountRef.current}/${maxConnectionAttempts}):`, error.message);
          }
          
          // Stop trying after max attempts
          if (connectionErrorCountRef.current >= maxConnectionAttempts) {
            console.warn("⚠️ Inbox: Max connection attempts reached. Socket disabled for this session.");
            socket.disconnect();
          }
        });

        // Listen for new messages
        socket.on("private-message", (messageData: any) => {
          if (!mounted) return;
          
          console.log("📨 Inbox: Received message:", messageData);
          
          // Extract message data
          const messageUserId = messageData?.userId ?? messageData?.fromUserId ?? "";
          const messageChatId = messageData?.chatId ?? "";
          const currentUserId = user?.id;
          
          if (!messageChatId) {
            console.warn("Inbox: Message missing chatId, skipping");
            return;
          }

          // Filter: Only process messages for chats where current user is a participant
          // The server should handle this, but we'll also check if it's a message to/from current user
          const messageToUserId = messageData?.toUserId ?? "";
          if (messageToUserId && messageToUserId !== currentUserId && messageUserId !== currentUserId) {
            console.log("Inbox: Message not for current user, skipping");
            return;
          }

          const normalizedMessage: ChatMessageType = {
            id: messageData?.id?.toString() ?? `msg-${Date.now()}-${Math.random()}`,
            type: messageData?.type ?? "text",
            content: messageData?.content ?? messageData?.message ?? "",
            edited: !!messageData?.edited,
            deleted: !!messageData?.deleted,
            fileId: messageData?.fileId ?? null,
            userId: messageUserId,
            created_at: messageData?.created_at ?? new Date().toISOString(),
            updated_at: messageData?.updated_at ?? new Date().toISOString(),
            chatId: messageChatId,
            user: messageData?.user ?? null,
            file: messageData?.file ?? null,
          };

          console.log("📨 Inbox: Processing message for chat:", messageChatId);

          // Update the chat list with the new message
          setData((prevData) => {
            if (!prevData) {
              console.log("Inbox: No data yet, fetching...");
              // If no data yet, fetch it
              if (fetchChatsRef.current) {
                fetchChatsRef.current(false);
              }
              return prevData;
            }

            const chats = [...prevData.data];
            const chatIndex = chats.findIndex(
              (chat) => chat.id === normalizedMessage.chatId
            );

            if (chatIndex !== -1) {
              // Chat exists, update it
              console.log("Inbox: Updating existing chat:", normalizedMessage.chatId);
              const updatedChat = { ...chats[chatIndex] };
              
              // Add message to chat if it doesn't exist
              const messageExists = updatedChat.messages.some(
                (msg) => msg.id === normalizedMessage.id
              );
              
              if (!messageExists) {
                updatedChat.messages = [...updatedChat.messages, normalizedMessage];
              }
              
              // Update chat's updated_at timestamp
              updatedChat.updated_at = normalizedMessage.created_at;

              // Remove chat from current position and add to top
              chats.splice(chatIndex, 1);
              chats.unshift(updatedChat);

              return {
                ...prevData,
                data: chats,
              };
            } else {
              // New chat - fetch updated list
              console.log("Inbox: New chat detected, fetching updated list");
              if (fetchChatsRef.current) {
                fetchChatsRef.current(false);
              }
              return prevData;
            }
          });
        });

        socket.on("error", (data: any) => {
          if (connectionErrorCountRef.current < maxConnectionAttempts) {
            console.error("🔴 Inbox: Socket error:", data);
          }
        });
      } catch (err) {
        console.error("❌ Inbox: Failed to setup socket:", err);
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      const sock = socketRef.current;
      if (sock) {
        sock.off("private-message");
        sock.off("connect");
        sock.off("disconnect");
        sock.off("connect_error");
        sock.off("error");
        sock.disconnect();
      }
      socketRef.current = null;
    };
  }, [user?.id]); // Re-setup if user changes

  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ThemedView padding={20}>
        <FlatList
          data={data?.data || []}
          keyExtractor={(item: Chat) => item.id}
          renderItem={({ item }) => (
            <ChatCompo chat={item} currentUserId={user?.id ?? ""} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]} // Android
              tintColor={COLORS.primary} // iOS
            />
          }
          ListHeaderComponent={() => (
            <ThemedView
              alignItems="center"
              flexDirection="row"
              marginBottom={20}
              gap={10}
              justifyContent="center"
            >
              <Message variant="Bold" size={20} color={COLORS.primary} />
              <ThemedText textAlign="center" fontSize={20}>
                Inbox
              </ThemedText>
            </ThemedView>
          )}
          ListEmptyComponent={() =>
            !loading && (
              <ThemedText textAlign="center" marginTop={40}>
                No chats yet
              </ThemedText>
            )
          }
          ListFooterComponent={() =>
            loading && !refreshing ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={{ marginTop: 20 }}
              />
            ) : null
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}
