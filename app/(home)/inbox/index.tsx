import ChatCompo from "@/components/common/chat-compo";
import { ThemedText } from "@/components/ui/themed-view";
import { useGetAllChats } from "@/hooks/chats.hooks";
import { useUserStore } from "@/store/store";
import { Chat, ChatResponse, Message as ChatMessageType } from "@/types/chat.types";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import type { Socket } from "socket.io-client";
import { getChatSocket } from "@/services/chat-socket.service";
import { createGroupChat } from "@/services/chats-service.service";
import { useGetAllFriends } from "@/hooks/friend-hooks.hooks";
import type { UserProfileR } from "@/types/auth.types";
import { toast } from "@/components/lib/toast-manager";
import { Ionicons } from "@expo/vector-icons";
import { generateURL } from "@/utils/image-utils.utils";
import useTheme from "@/hooks/use-theme";

export default function Page() {
  const theme = useTheme();
  const [data, setData] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const fetchChatsRef = useRef<((showMainLoader?: boolean) => Promise<void>) | null>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [friends, setFriends] = useState<UserProfileR[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [query, setQuery] = useState("");

  const { user } = useUserStore();

  const fetchChats = useCallback(async (showMainLoader = true) => {
    try {
      if (showMainLoader) setLoading(true);
      const response = await useGetAllChats();
      setData(response);
    } catch {
      // keep previous list
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChatsRef.current = fetchChats;
  }, [fetchChats]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useFocusEffect(
    useCallback(() => {
      fetchChats(false);
    }, [fetchChats])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChats(false);
  }, [fetchChats]);

  useEffect(() => {
    if (!groupModalOpen) return;
    useGetAllFriends({ filterBy: { filterBy: "friends" } }).then((response) => {
      setFriends(response?.data ?? []);
    });
  }, [groupModalOpen]);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMemberIds.length < 2) {
      toast.show({
        title: "Enter a name and select at least two friends.",
        type: "error",
      });
      return;
    }
    try {
      setCreatingGroup(true);
      await createGroupChat({
        name: groupName.trim(),
        memberIds: selectedMemberIds,
      });
      setGroupModalOpen(false);
      setGroupName("");
      setSelectedMemberIds([]);
      await fetchChats(false);
    } finally {
      setCreatingGroup(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;
    let onMessage: ((messageData: any) => void) | undefined;

    const setupSocket = async () => {
      try {
        const socket = await getChatSocket();
        if (!socket || !mounted) return;
        socketRef.current = socket;

        onMessage = (messageData: any) => {
          if (!mounted) return;
          messageData = messageData?.data ?? messageData;

          const messageUserId =
            messageData?.userId ?? messageData?.fromUserId ?? "";
          const messageChatId = messageData?.chatId ?? "";
          const currentUserId = user?.id;
          if (!messageChatId) return;

          const messageToUserId = messageData?.toUserId ?? "";
          if (
            messageToUserId &&
            messageToUserId !== currentUserId &&
            messageUserId !== currentUserId
          ) {
            return;
          }

          const normalizedMessage: ChatMessageType = {
            id:
              messageData?.id?.toString() ??
              `msg-${Date.now()}-${Math.random()}`,
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

          setData((prevData) => {
            if (!prevData) {
              fetchChatsRef.current?.(false);
              return prevData;
            }

            const chats = [...prevData.data];
            const chatIndex = chats.findIndex(
              (chat) => chat.id === normalizedMessage.chatId
            );

            if (chatIndex === -1) {
              fetchChatsRef.current?.(false);
              return prevData;
            }

            const updatedChat = { ...chats[chatIndex] };
            const messageExists = updatedChat.messages.some(
              (msg) => msg.id === normalizedMessage.id
            );
            if (!messageExists) {
              updatedChat.messages = [
                ...updatedChat.messages,
                normalizedMessage,
              ];
            }
            updatedChat.updated_at = normalizedMessage.created_at;
            chats.splice(chatIndex, 1);
            chats.unshift(updatedChat);
            return { ...prevData, data: chats };
          });
        };

        socket.on("private-message", onMessage);
        socket.on("chat-message", onMessage);
      } catch {
        // ignore socket errors in list
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      const sock = socketRef.current;
      if (sock && onMessage) {
        sock.off("private-message", onMessage);
        sock.off("chat-message", onMessage);
      }
      socketRef.current = null;
    };
  }, [user?.id]);

  const filteredChats = useMemo(() => {
    const list = data?.data || [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((chat) => {
      const isGroup =
        chat.type === "group" ||
        chat.isGroup === true ||
        chat.participants.length > 2;
      const other = chat.participants.find((p) => p.userId !== user?.id)?.user;
      const name = isGroup
        ? chat.name || "Group chat"
        : other?.username ||
          `${other?.first_name || ""} ${other?.last_name || ""}`;
      return name.toLowerCase().includes(q);
    });
  }, [data?.data, query, user?.id]);

  const noteFriends = friends.slice(0, 8);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={25} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.titleWrap} activeOpacity={0.7}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{user?.username || "Messages"}</Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setGroupModalOpen(true)}
          hitSlop={10}
          accessibilityLabel="New message"
        >
          <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.colors.soft }]}>
        <Ionicons name="search" size={16} color={theme.colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search"
          placeholderTextColor={theme.colors.muted}
          style={[styles.searchInput, { color: theme.colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item: Chat) => item.id}
        renderItem={({ item }) => (
          <ChatCompo chat={item} currentUserId={user?.id ?? ""} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {(noteFriends.length > 0 || !!user) && (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={
                  user
                    ? [
                        {
                          id: user.id,
                          username: "Your note",
                          profile_picture: user.profile_picture,
                          isSelf: true,
                        } as any,
                        ...noteFriends,
                      ]
                    : noteFriends
                }
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.notesRow}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.noteItem} activeOpacity={0.8}>
                    <View style={styles.noteRing}>
                      <Image
                        source={
                          item.profile_picture?.url
                            ? {
                                uri: generateURL({
                                  url: item.profile_picture.url,
                                }),
                              }
                            : require("@/assets/user.png")
                        }
                        style={styles.noteAvatar}
                      />
                    </View>
                    <Text style={styles.noteLabel} numberOfLines={1}>
                      {item.isSelf ? "Your note" : item.username}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Messages</Text>
              <TouchableOpacity>
                <Text style={[styles.requests, { color: theme.colors.primary }]}>Requests</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { borderColor: theme.colors.primary, backgroundColor: theme.colors.soft }]}>
                <Ionicons name="paper-plane-outline" size={32} color={theme.colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Your messages</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.muted }]}>
                Send a message to start a chat.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : null
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <Modal
        visible={groupModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setGroupModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setGroupModalOpen(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New message</Text>
              <TouchableOpacity
                onPress={handleCreateGroup}
                disabled={creatingGroup}
              >
                {creatingGroup ? (
                  <ActivityIndicator color={theme.colors.primary} />
                ) : (
                  <Text style={styles.modalCreate}>Chat</Text>
                )}
              </TouchableOpacity>
            </View>
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Group name (optional for 2+)"
              placeholderTextColor="#8e8e8e"
              style={styles.modalInput}
            />
            <Text style={styles.toLabel}>To</Text>
            <FlatList
              data={friends}
              keyExtractor={(friend) => friend.id}
              renderItem={({ item }) => {
                const selected = selectedMemberIds.includes(item.id);
                return (
                  <TouchableOpacity
                    onPress={() =>
                      setSelectedMemberIds((current) =>
                        selected
                          ? current.filter((id) => id !== item.id)
                          : [...current, item.id]
                      )
                    }
                    style={styles.friendRow}
                  >
                    <Image
                      source={
                        item.profile_picture?.url
                          ? {
                              uri: generateURL({
                                url: item.profile_picture.url,
                              }),
                            }
                          : require("@/assets/user.png")
                      }
                      style={styles.friendAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.friendName}>
                        {item.first_name} {item.last_name}
                      </Text>
                      <Text style={styles.friendUser}>@{item.username}</Text>
                    </View>
                    <View
                      style={[
                        styles.check,
                        selected && styles.checkActive,
                      ]}
                    >
                      {selected && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#262626",
  },
  searchBox: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#efefef",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#262626",
    paddingVertical: 0,
  },
  notesRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 16,
  },
  noteItem: {
    width: 72,
    alignItems: "center",
  },
  noteRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    borderColor: "#dbdbdb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  noteAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#efefef",
  },
  noteLabel: {
    fontSize: 12,
    color: "#262626",
    textAlign: "center",
    width: 72,
  },
  sectionRow: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#262626",
  },
  requests: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0095f6",
  },
  list: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  empty: {
    alignItems: "center",
    paddingTop: 64,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#262626",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8e8e8e",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCard: {
    maxHeight: "88%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 20,
  },
  modalHeader: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#dbdbdb",
  },
  modalCancel: { fontSize: 16, color: "#262626" },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#262626" },
  modalCreate: { fontSize: 16, fontWeight: "700", color: "#0095f6" },
  modalInput: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#efefef",
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#262626",
  },
  toLabel: {
    marginTop: 14,
    marginBottom: 4,
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#efefef",
  },
  friendName: { fontSize: 14, fontWeight: "600", color: "#262626" },
  friendUser: { fontSize: 13, color: "#8e8e8e", marginTop: 1 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#dbdbdb",
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: {
    backgroundColor: "#0095f6",
    borderColor: "#0095f6",
  },
});
