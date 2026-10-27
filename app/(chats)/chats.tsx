import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  View,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Keyboard,
  RefreshControl,
  Dimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  FadeIn,
  SlideInRight,
  SlideInLeft,
} from "react-native-reanimated";
import {
  Alarm,
  Gift as GiftIcon,
  Send2,
  Image as ImageIcon,
  CloseCircle,
  Call,
  VideoCircle,
  CallReceived,
  CallCalling,
  CallSlash,
} from "iconsax-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { ChatMessage } from "@/types/chat.types";
import type { ReactionEmoji } from "@/types/chat.types";
import { HeaderChat } from "@/components/common/chats/header-chat";
import { useGetChatsPerFriend } from "@/hooks/chats.hooks";
import ChatPanicButton from "@/components/common/chats/panic-button-icon";
import { toast } from "@/components/lib/toast-manager";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import LottieView from "lottie-react-native";
import { Gift as Gifts } from "@/types/wallet.types";
import { useGetWallet, useGetAllGifts } from "@/hooks/wallet-hooks.hooks";
import { generateURL } from "@/utils/image-utils.utils";
import GiftCompo from "@/components/common/chats/gift-compo";
import { useUserStore } from "@/store/store";
import * as ImagePicker from "expo-image-picker";
import { useUploadService } from "@/hooks/auth-hooks.hooks";
import {
  getAllChatFriends,
  getChatDetail,
  reactToMessage,
  sendChatMessage,
} from "@/services/chats-service.service";
import { getChatSocket } from "@/services/chat-socket.service";
import type { Socket } from "socket.io-client";

type Params = {
  chatId?: string;
  userId?: string;
  recipientId?: string;
  recieverId?: string;
  profileUrl?: string;
  name?: string;
};

const DEFAULT_USER_IMAGE = require("@/assets/user.png");
const REACTIONS: ReactionEmoji[] = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

const Chats: React.FC = () => {
  const { chatId: routeChatId, name, profileUrl, userId, recipientId } =
    useLocalSearchParams<Params>() as unknown as Params;
  const { user } = useUserStore();
  const currentUserId = user?.id ?? "";
  const otherUserId = recipientId ?? userId ?? "";
  const [chatId, setChatId] = useState(routeChatId ?? "");
  const [canSendMessages, setCanSendMessages] = useState(true);
  const [isGroup, setIsGroup] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);

  // state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [gifts, setGifts] = useState<Gifts[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showGiftAnimation, setShowGiftAnimation] = useState(false);
  const giftAnimationRef = useRef<LottieView>(null);

  const socketRef = useRef<Socket | null>(null);
  const [hasMoney, setHasMoney] = useState(false);
  const [checkingWallet, setCheckingWallet] = useState(true);
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const flatListRef = useRef<FlatList<ChatMessage> | null>(null);

  // const joinCall()

  // Local image preview state used by ChatInput; exported here to allow manual upload/use if needed
  const [localImage, setLocalImage] = useState<string | null>(null);

  /* ---------------- helpers ---------------- */
  const scrollToBottom = (animated = true) => {
    try {
      // small timeout to wait for layout/render
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated });
      }, 100);
    } catch {
      /* ignore */
    }
  };

  const normalizeMessage = useCallback(
    (data: any): ChatMessage => ({
      id: String(data?.id ?? data?.clientId ?? `message-${Date.now()}`),
      clientId: data?.clientId,
      type: data?.type ?? "text",
      content: data?.content ?? data?.message ?? "",
      edited: !!data?.edited,
      deleted: !!data?.deleted,
      fileId: data?.fileId ?? null,
      userId: data?.userId ?? data?.fromUserId ?? "",
      created_at: data?.created_at ?? new Date().toISOString(),
      updated_at: data?.updated_at ?? new Date().toISOString(),
      chatId: String(data?.chatId ?? chatId),
      user: data?.user ?? null,
      file: data?.file ?? null,
      replyToMessageId: data?.replyToMessageId ?? null,
      replyToMessage: data?.replyToMessage ?? data?.reply_to_message ?? null,
      reactions: data?.reactions ?? [],
    }),
    [chatId]
  );

  const mergeMessages = useCallback((current: ChatMessage[], incoming: ChatMessage[]) => {
    const merged = [...current];
    incoming.forEach((message) => {
      const index = merged.findIndex(
        (existing) =>
          existing.id === message.id ||
          (!!message.clientId && existing.clientId === message.clientId) ||
          (existing.id.startsWith("local-") &&
            existing.userId === message.userId &&
            existing.content === message.content &&
            Math.abs(
              new Date(existing.created_at).getTime() -
                new Date(message.created_at).getTime()
            ) < 15000)
      );
      if (index >= 0) merged[index] = { ...merged[index], ...message };
      else merged.push(message);
    });
    return merged;
  }, []);

  useEffect(() => {
    if (routeChatId) {
      setChatId(routeChatId);
      return;
    }
    if (!otherUserId) return;
    getAllChatFriends().then((response) => {
      const chats = response?.data ?? [];
      const existing = chats.find((chat: any) =>
        chat?.participants?.some((participant: any) => participant.userId === otherUserId)
      );
      if (existing?.id) setChatId(existing.id);
    });
  }, [routeChatId, otherUserId]);

  /* ---------------- fetch gifts ---------------- */
  useEffect(() => {
    let mounted = true;
    const fetchGifts = async () => {
      try {
        const res = await useGetAllGifts();
        if (!mounted) return;
        setGifts(res?.data ?? []);
      } catch (err) {
      }
    };
    fetchGifts();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------- check wallet balance ---------------- */
  const checkWalletBalance = useCallback(async () => {
    try {
      setCheckingWallet(true);
      const response = await useGetWallet();
      const balance = Number(response?.data?.balance ?? 0);
      setHasMoney(balance >= 0.5);
    } catch (err) {
      setHasMoney(false);
    } finally {
      setCheckingWallet(false);
    }
  }, []);

  useEffect(() => {
    checkWalletBalance();
  }, [checkWalletBalance]);

  /* ---------------- fetch messages ---------------- */
  const fetchMessages = useCallback(async (nextPage = 1) => {
    if (!chatId) {
      setLoadingMessages(false);
      return;
    }
    try {
      if (nextPage === 1) setLoadingMessages(true);
      else loadingMoreRef.current = true;
      const [res, detail] = await Promise.all([
        useGetChatsPerFriend({ id: chatId, page: nextPage, limit: 30 }),
        nextPage === 1 ? getChatDetail({ id: chatId }) : Promise.resolve(null),
      ]);
      const batch = (res?.data ?? []).map(normalizeMessage);
      setMessages((previous) =>
        nextPage === 1
          ? mergeMessages([], batch)
          : mergeMessages(batch, previous)
      );
      const meta = res?.meta;
      setPage(nextPage);
      setHasMore(meta ? nextPage < meta.totalPages : batch.length === 30);
      const chatDetail = detail?.data ?? detail;
      if (chatDetail && typeof chatDetail.can_send_messages === "boolean") {
        setCanSendMessages(chatDetail.can_send_messages);
      }
      setIsGroup(
        chatDetail?.type === "group" ||
          chatDetail?.isGroup === true ||
          (chatDetail?.participants?.length ?? 0) > 2
      );
    } catch (err) {
      toast.show({
        title: "Unable to load messages",
        type: "error",
        duration: 2000,
      });
    } finally {
      setLoadingMessages(false);
      loadingMoreRef.current = false;
      setRefreshing(false);
      // scroll after load
      scrollToBottom(false);
    }
  }, [chatId, mergeMessages, normalizeMessage]);

  // refresh when screen focused (implements "refresh every time I go there")
  useFocusEffect(
    useCallback(() => {
      fetchMessages(1);
      checkWalletBalance();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId])
  );

  useEffect(() => {
    // initial fetch
    if (chatId) fetchMessages(1);
  }, [chatId, fetchMessages]);

  /* ---------------- setup socket ---------------- */
  useEffect(() => {
    let mounted = true;
    let onError: ((data: any) => void) | undefined;
    let onMessage: ((data: any) => void) | undefined;
    let onReaction: ((data: any) => void) | undefined;
    const setup = async () => {
      try {
        const socket = await getChatSocket();
        if (!socket || !mounted) return;

        socketRef.current = socket;
        if (chatId) socket.emit("join-chat", { chatId });

        onError = (data: any) => {
          setSending(false);
          toast.show({
            title: data?.message || "Socket error",
            type: "error",
            duration: 2000,
          });
          if (data?.message === "Insufficient balance to send message.") {
            setHasMoney(false);
            toast.show({
              title: "Insufficient balance to send message.",
              type: "error",
              duration: 4000,
            });
          }
        };
        onMessage = (data: any) => {
          if (!mounted) return;
          const payload = data?.data ?? data;
          if (String(payload?.chatId ?? "") !== String(chatId)) return;
          const normalized = normalizeMessage(payload);
          setMessages((prev) => mergeMessages(prev, [normalized]));
          setTimeout(() => scrollToBottom(true), 100);
        };
        onReaction = (data: any) => {
          const payload = data?.data ?? data;
          if (String(payload?.chatId ?? chatId) !== String(chatId)) return;
          const messageId = String(payload?.messageId ?? payload?.message?.id ?? "");
          setMessages((previous) =>
            previous.map((message) =>
              message.id === messageId
                ? {
                    ...message,
                    reactions: payload?.reactions ?? payload?.message?.reactions ?? [],
                  }
                : message
            )
          );
        };

        socket.on("error", onError);
        socket.on("private-message", onMessage);
        socket.on("chat-message", onMessage);
        socket.on("message-reaction", onReaction);
      } catch (err) {
      }
    };

    setup();

    return () => {
      mounted = false;
      const sock = socketRef.current;
      if (sock) {
        if (chatId) sock.emit("leave-chat", { chatId });
        if (onMessage) {
          sock.off("private-message", onMessage);
          sock.off("chat-message", onMessage);
        }
        if (onReaction) sock.off("message-reaction", onReaction);
        if (onError) sock.off("error", onError);
      }
      socketRef.current = null;
    };
  }, [chatId, mergeMessages, normalizeMessage]);

  /* ---------------- sort messages ----------------
     all messages in chronological order (announcements, calls, and regular messages mixed)
  */
  const sortedMessages = useMemo(() => {
    const arr = [...messages];

    // Sort all messages chronologically by creation time
    arr.sort(
      (a, b) =>
        (new Date(a.created_at).getTime() || 0) -
        (new Date(b.created_at).getTime() || 0)
    );

    return arr;
  }, [messages]);

  /* ---------------- send message (with optional image upload) ----------------
     - keep message type as "text" even when image attached
     - upload image first (if provided), get fileId and file url
     - include fileId in socket emit and optimistic message
  */
  const handleSend = useCallback(
    async (msg: string, imageUri?: string) => {
      if (!msg.trim() && !imageUri) {
        toast.show({
          title: "Message cannot be empty.",
          type: "error",
          duration: 2000,
        });
        return;
      }
      if (!canSendMessages) {
        toast.show({
          title: "You cannot send messages in this chat.",
          type: "error",
          duration: 2500,
        });
        return;
      }
      if (!chatId) {
        toast.show({
          title: "This conversation is not ready yet.",
          type: "error",
          duration: 2000,
        });
        return;
      }

      // always scroll to bottom before sending
      scrollToBottom(true);

      if (sending) {
        toast.show({
          title: "Please wait, message sending...",
          type: "info",
          duration: 1500,
        });
        return;
      }

      if (!hasMoney) {
        toast.show({
          title: "Insufficient balance — fund your wallet.",
          type: "error",
          duration: 2500,
        });
        return;
      }

      const sock = socketRef.current;

      setSending(true);
      try {
        let uploadedFileId: string | null = null;
        let uploadedFileUrl: string | null = null;

        if (imageUri) {
          // prepare file and upload
          const file = {
            uri: imageUri,
            name: "chat_image.jpg",
            type: "image/jpeg",
          };
          const res = await useUploadService({ file });
          uploadedFileId = res?.data?.[0]?.id ?? null;
          uploadedFileUrl = res?.data?.[0]?.url ?? null;

          // log id after upload (you requested)
        }

        // optimistic message to UI
        const clientId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const optimisticMsg: ChatMessage = {
          id: clientId,
          clientId,
          type: "text", // keep as text per your instruction
          content: msg,
          edited: false,
          deleted: false,
          fileId: uploadedFileId,
          userId: user?.id ?? currentUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          chatId: chatId ?? "",
          user: null,
          file: uploadedFileUrl ? { url: uploadedFileUrl } : null,
          replyToMessageId: replyingTo?.id ?? null,
          replyToMessage: replyingTo
            ? {
                id: replyingTo.id,
                content: replyingTo.content,
                deleted: replyingTo.deleted,
                userId: replyingTo.userId,
              }
            : null,
          reactions: [],
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        Keyboard.dismiss();

        setReplyingTo(null);
        const payload = {
          chatId,
          toUserId: otherUserId || undefined,
          message: msg,
          content: msg,
          fileId: uploadedFileId,
          replyToMessageId: optimisticMsg.replyToMessageId,
          clientId,
        };

        let response: any;
        if (sock?.connected) {
          try {
            response = await sock
              .timeout(5000)
              .emitWithAck(isGroup ? "chat-message" : "private-message", payload);
          } catch {
            response = await sendChatMessage({
              chatId,
              content: msg,
              fileId: uploadedFileId,
              replyToMessageId: optimisticMsg.replyToMessageId,
              toUserId: otherUserId || undefined,
              clientId,
            });
          }
        } else {
          response = await sendChatMessage({
            chatId,
            content: msg,
            fileId: uploadedFileId,
            replyToMessageId: optimisticMsg.replyToMessageId,
            toUserId: otherUserId || undefined,
            clientId,
          });
        }
        const serverMessage = response?.data ?? response;
        if (serverMessage?.id) {
          setMessages((previous) =>
            mergeMessages(previous, [normalizeMessage({ ...serverMessage, clientId })])
          );
        }
        setSending(false);
        // fetchMessages();
      } catch (err) {
        toast.show({
          title: "Something went wrong while sending.",
          type: "error",
          duration: 2000,
        });
        setSending(false);
      }
    },
    [
      canSendMessages,
      chatId,
      currentUserId,
      hasMoney,
      isGroup,
      mergeMessages,
      normalizeMessage,
      otherUserId,
      replyingTo,
      sending,
      user,
    ]
  );

  /* ---------------- pull-to-refresh handler ---------------- */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMessages(1);
  }, [fetchMessages]);

  const loadOlderMessages = useCallback(() => {
    if (hasMore && !loadingMoreRef.current && !loadingMessages) {
      fetchMessages(page + 1);
    }
  }, [fetchMessages, hasMore, loadingMessages, page]);

  const handleReaction = useCallback(
    async (message: ChatMessage, emoji: ReactionEmoji) => {
      if (message.id.startsWith("local-")) return;
      try {
        const response = await reactToMessage({ messageId: message.id, emoji });
        const payload = response?.data ?? response;
        if (payload?.reactions) {
          setMessages((previous) =>
            previous.map((item) =>
              item.id === message.id ? { ...item, reactions: payload.reactions } : item
            )
          );
        }
      } catch {
        toast.show({ title: "Unable to update reaction.", type: "error" });
      }
    },
    []
  );

  /* ---------------- Render helpers ---------------- */
  const renderEmpty = () => {
    if (loadingMessages) {
      return (
        <View style={{ padding: 20, alignItems: "center" }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <ThemedText color="#666">No messages yet — say hi!</ThemedText>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, paddingTop: 40 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Confetti animation - positioned absolutely to cover entire screen */}
      {showGiftAnimation && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: Dimensions.get("window").width,
            height: Dimensions.get("window").height,
            zIndex: 10000,
            elevation: 10000,
          }}
          pointerEvents="none"
        >
          <LottieView
            ref={giftAnimationRef}
            source={require("@/assets/jsons/splash.json")}
            style={{
              width: "100%",
              height: "100%",
            }}
            autoPlay
            loop={false}
            onAnimationFinish={() => setShowGiftAnimation(false)}
          />
        </View>
      )}

      <SafeAreaView style={styles.container}>
        <HeaderChat
          message={messages[messages.length - 1]}
          profileUrl={profileUrl ?? ""}
          name={name ?? "Unknown"}
          recipientId={otherUserId}
          chatId={chatId}
        />

        <FlatList
          ref={flatListRef}
          data={sortedMessages}
          keyExtractor={(item) => item.id ?? `${item.created_at ?? Date.now()}`}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item, index }) => (
            <MessageBubble
              profileUrl={profileUrl}
              item={item}
              currentUserId={currentUserId}
              index={index}
              onReply={setReplyingTo}
              onReaction={handleReaction}
            />
          )}
          onScroll={({ nativeEvent }) => {
            if (nativeEvent.contentOffset.y < 80) loadOlderMessages();
          }}
          scrollEventThrottle={200}
          ListEmptyComponent={renderEmpty}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={["50%", "75%"]}
          enablePanDownToClose
          style={{
            zIndex: 9999,
            elevation: 9999,
          }}
          containerStyle={{
            zIndex: 9999,
            elevation: 9999,
          }}
          backdropComponent={BottomSheetBackdrop}
          enableDynamicSizing={false}
        >
          <BottomSheetFlatList
            data={gifts}
            keyExtractor={(item) => item.id.toString()}
            numColumns={4}
            contentContainerStyle={{
              paddingBottom: 40,
              paddingTop: 20,
              paddingHorizontal: 20,
            }}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 20,
            }}
            renderItem={({ item }) => (
              <GiftCompo
                onSuccess={() => {
                  bottomSheetRef.current?.collapse();
                  setShowGiftAnimation(true);
                }}
                gift={item}
                receiverId={userId ?? ""}
              />
            )}
          />
        </BottomSheet>

        {checkingWallet ? (
          <ThemedView
            justifyContent="center"
            alignItems="center"
            padding={20}
            // backgroundColor="#fafafa"
            borderTopWidth={0.3}
            borderTopColor="#eee"
          >
            <ActivityIndicator size="small" color={COLORS.primary} />
          </ThemedView>
        ) : hasMoney && canSendMessages ? (
          <ChatInput
            onSend={handleSend}
            onGiftPress={() => bottomSheetRef.current?.expand()}
            sending={sending}
            // expose the localImage setter so you can set it elsewhere if needed
            setLocalImage={setLocalImage}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />
        ) : (
          <ThemedView
            justifyContent="center"
            alignItems="center"
            padding={20}
            // backgroundColor="#fff8f8"
            borderTopWidth={0.3}
            borderTopColor="#eee"
          >
            <ThemedText fontSize={14} fontWeight="600" textAlign="center">
              {canSendMessages
                ? "Insufficient balance — fund your wallet to chat."
                : "Messaging is disabled for this chat."}
            </ThemedText>
            {canSendMessages && <TouchableOpacity
              onPress={() => router.push("/(settings)/wallet/fund-wallet")}
              style={{
                marginTop: 12,
                backgroundColor: COLORS.primary,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 999,
              }}
            >
              <ThemedText color="#fff" fontWeight="600">
                Fund Wallet
              </ThemedText>
            </TouchableOpacity>}
          </ThemedView>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

/* ---------------- Message Bubble ---------------- */
export const MessageBubble: React.FC<{
  item: ChatMessage;
  currentUserId: string;
  profileUrl?: string;
  index?: number;
  onReply?: (message: ChatMessage) => void;
  onReaction?: (message: ChatMessage, emoji: ReactionEmoji) => void;
}> = ({
  item,
  currentUserId,
  profileUrl,
  index = 0,
  onReply,
  onReaction,
}) => {
  const isMe = item.userId === currentUserId;
  const { user } = useUserStore();
  const [showActions, setShowActions] = useState(false);

  // Handle call history display (WhatsApp style)
  //@ts-ignore
  if (item.type === "call" || item.type === "video-call" || item.content?.toLowerCase().includes("call")) {
    //@ts-ignore
    const isVideoCall = item.type === "video-call" || item.content?.toLowerCase().includes("video");
    const isMissedCall = item.content?.toLowerCase().includes("missed");
    const isIncoming = item.content?.toLowerCase().includes("incoming");
    const isOutgoing = item.content?.toLowerCase().includes("outgoing");

    return (
      <Animated.View
        entering={FadeIn.duration(400).delay(index * 50)}
        style={styles.callHistoryContainer}
      >
        {/* Avatar */}
        <Image
          source={
            !isMe && profileUrl && user?.profile_picture?.url
              ? { uri: generateURL({ url: profileUrl }) }
              : isMe && user?.profile_picture?.url
                ? { uri: generateURL({ url: user.profile_picture.url }) }
                : DEFAULT_USER_IMAGE
          }
          style={styles.callAvatar}
        />

        {/* Call Info */}
        <View style={styles.callInfo}>
          <View style={styles.callTitleRow}>
            {isVideoCall ? (
              <VideoCircle size={18} color={isMissedCall ? "#ff3b30" : COLORS.primary} variant="Bold" />
            ) : (
              <Call size={18} color={isMissedCall ? "#ff3b30" : COLORS.primary} variant="Bold" />
            )}
            <ThemedText
              fontSize={15}
              fontWeight="600"
              color={isMissedCall ? "#ff3b30" : "#000"}
            >
              {isVideoCall ? "Video call" : "Voice call"}
            </ThemedText>
          </View>

          <View style={styles.callStatusRow}>
            {isMissedCall ? (
              <>
                <CallSlash size={14} color="#ff3b30" />
                <ThemedText fontSize={13} color="#ff3b30">
                  Missed call
                </ThemedText>
              </>
            ) : isIncoming ? (
              <>
                <CallReceived size={14} color="#34c759" />
                <ThemedText fontSize={13} color="#666">
                  Incoming
                </ThemedText>
              </>
            ) : isOutgoing ? (
              <>
                <CallCalling size={14} color="#666" />
                <ThemedText fontSize={13} color="#666">
                  Outgoing
                </ThemedText>
              </>
            ) : null}

            {item.created_at && (
              <>
                <View style={styles.callDot} />
                <ThemedText fontSize={12} color="#999">
                  {new Date(item.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </ThemedText>
              </>
            )}
          </View>
        </View>

        {/* Call Icon Button */}
        <TouchableOpacity
          style={styles.callIconButton}
          accessibilityLabel={isVideoCall ? "Make video call" : "Make voice call"}
        >
          {isVideoCall ? (
            <VideoCircle size={24} color={COLORS.primary} variant="Bold" />
          ) : (
            <Call size={24} color={COLORS.primary} variant="Bold" />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (item.type === "announcement") {
    return (
      <Animated.View
        entering={FadeIn.duration(400).delay(index * 50)}
        style={styles.announcementContainer}
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
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={
        isMe
          ? SlideInRight.duration(300).springify().damping(15)
          : SlideInLeft.duration(300).springify().damping(15)
      }
      style={[
        styles.messageRow,
        isMe ? styles.myMessageRow : styles.otherMessageRow,
      ]}
    >
      {/* sender avatar on left when sender is me (as requested previously) */}
      {isMe && (
        <Animated.View entering={FadeIn.duration(300).delay(100)}>
          <Image
            source={
              user?.profile_picture?.url
                ? { uri: generateURL({ url: user.profile_picture.url }) }
                : DEFAULT_USER_IMAGE
            }
            defaultSource={DEFAULT_USER_IMAGE}
            onError={() => { }}
            style={styles.avatar}
          />
        </Animated.View>
      )}
      {item.file?.url ? (
        // show image preview inside bubble if file exists (optimistic or real)
        <Animated.View entering={FadeIn.duration(300)}>
          <Image
            source={{ uri: generateURL({ url: item.file.url }) }}
            style={{ width: 180, height: 180, borderRadius: 12 }}
          />
        </Animated.View>
      ) : null}

      {(item.replyToMessage || item.content) && (
        <Animated.View
          entering={FadeIn.duration(300).delay(50)}
          style={[
            styles.messageBubble,
            isMe ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onLongPress={() => setShowActions((visible) => !visible)}
          >
            {item.replyToMessage && (
              <View style={styles.quote}>
                <ThemedText fontSize={11} color={isMe ? "#eee" : "#666"}>
                  {item.replyToMessage.deleted
                    ? "Deleted message"
                    : item.replyToMessage.content || "Attachment"}
                </ThemedText>
              </View>
            )}
            <ThemedText color={isMe ? "#fff" : "#000"}>
              {item.deleted ? "This message was deleted" : item.content}
            </ThemedText>

            {item.created_at && (
              <ThemedText
                fontSize={8}
                color={isMe ? "#eee" : "#666"}
                marginTop={1}
                alignSelf="flex-end"
                opacity={0.8}
              >
                {new Date(item.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </ThemedText>
            )}
          </TouchableOpacity>
          {!!item.reactions?.length && (
            <View style={styles.reactionSummary}>
              <ThemedText fontSize={12}>
                {Array.from(new Set(item.reactions.map((reaction) => reaction.emoji))).join(" ")}
              </ThemedText>
            </View>
          )}
          {showActions && !item.deleted && (
            <View style={styles.messageActions}>
              {REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => {
                    onReaction?.(item, emoji);
                    setShowActions(false);
                  }}
                >
                  <ThemedText fontSize={18}>{emoji}</ThemedText>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => {
                  onReply?.(item);
                  setShowActions(false);
                }}
              >
                <ThemedText fontSize={12} weight="semibold">
                  Reply
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      )}
      {!isMe && (
        <Animated.View entering={FadeIn.duration(300).delay(100)}>
          <Image
            source={
              profileUrl
                ? { uri: generateURL({ url: profileUrl }) }
                : DEFAULT_USER_IMAGE
            }
            style={styles.avatar}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
};

/* ---------------- Chat Input (with image upload + preview) ---------------- */
const ChatInput: React.FC<{
  onSend: (msg: string, imageUri?: string) => void;
  onGiftPress: () => void;
  sending?: boolean;
  setLocalImage?: (uri: string | null) => void; // optional setter exposed to parent
  replyingTo?: ChatMessage | null;
  onCancelReply?: () => void;
}> = ({
  onSend,
  onGiftPress,
  sending = false,
  setLocalImage,
  replyingTo,
  onCancelReply,
}) => {
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      // Check if permission is already granted
      const permissionStatus = await ImagePicker.getMediaLibraryPermissionsAsync();

      let finalStatus = permissionStatus.status;

      // Request permission if not granted
      if (finalStatus !== "granted") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalStatus = status;
      }

      // Handle permission denial
      if (finalStatus !== "granted") {
        toast.show({
          title: "Permission denied — allow gallery access to upload an image.",
          type: "error",
          duration: 2500,
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        if (setLocalImage) setLocalImage(result.assets[0].uri);
      }
    } catch (err) {
      toast.show({
        title: "Error selecting image",
        type: "error",
        duration: 2000,
      });
    }
  };

  const handleSend = () => {
    if ((!text.trim() && !imageUri) || sending) return;
    onSend(text.trim(), imageUri ?? undefined);
    setText("");
    setImageUri(null);
    if (setLocalImage) setLocalImage(null);
  };

  return (
    <ThemedView
      flexDirection="column"
      borderTopWidth={0.2}
      borderTopColor="#eee"
      // backgroundColor="#fafafa"
      padding={10}
      gap={6}
    >
      {replyingTo && (
        <View style={styles.replyPreview}>
          <View style={{ flex: 1 }}>
            <ThemedText fontSize={11} weight="semibold">
              Replying to message
            </ThemedText>
            <ThemedText numberOfLines={1} fontSize={12} color="#666">
              {replyingTo.deleted ? "Deleted message" : replyingTo.content || "Attachment"}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={onCancelReply}>
            <CloseCircle size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}
      {/* image preview */}
      {imageUri && (
        <View
          style={{
            alignSelf: "flex-start",
            position: "relative",
            marginBottom: 4,
          }}
        >
          <Image
            source={{ uri: imageUri }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 12,
              borderWidth: 0.5,
              borderColor: "#ccc",
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setImageUri(null);
              if (setLocalImage) setLocalImage(null);
            }}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: 20,
              padding: 3,
            }}
          >
            <CloseCircle size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* input row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <ChatPanicButton />

        <TouchableOpacity
          onPress={pickImage}
          accessibilityLabel="Upload image"
          style={{
            backgroundColor: COLORS.primary,
            padding: 10,
            borderRadius: 50,
          }}
        >
          <ImageIcon size={20} color={"#fff"} />
        </TouchableOpacity>

        <TextInput
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={text}
          onChangeText={setText}
          style={styles.textInput}
          editable={!sending}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={onGiftPress}
          accessibilityLabel="Open gifts"
        >
          <GiftIcon size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          accessibilityLabel="Send message"
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Send2 size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 200,
    fontFamily: "Quicksand_500Medium",
    color: "#000",
    backgroundColor: "#fff",
    borderWidth: 0.3,
    borderColor: "#ddd",
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 400,
    marginLeft: 6,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  announcementContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 10,
    marginHorizontal: 40,
    borderRadius: 16,
    backgroundColor: COLORS.primary + "15",
    gap: 8,
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: 6,
    alignItems: "flex-end",
  },
  myMessageRow: {
    justifyContent: "flex-end",
  },
  otherMessageRow: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 18,
    marginHorizontal: 8,
    backgroundColor: "#ddd",
  },
  messageBubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  myMessage: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
    borderBottomLeftRadius: 18,
  },
  otherMessage: {
    backgroundColor: "#f1f1f1",
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 18,
  },
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: "rgba(255,255,255,0.7)",
    paddingLeft: 8,
    marginBottom: 6,
    opacity: 0.9,
  },
  messageActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  reactionSummary: {
    alignSelf: "flex-end",
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    backgroundColor: "#f3f3f3",
    borderRadius: 8,
  },
  // WhatsApp-style call history
  callHistoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e5e5e5",
    gap: 12,
  },
  callAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ddd",
  },
  callInfo: {
    flex: 1,
    gap: 4,
  },
  callTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  callStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  callDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#999",
    marginHorizontal: 2,
  },
  callIconButton: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: COLORS.primary + "10",
  },
});

export default Chats;
