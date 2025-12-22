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
} from "iconsax-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { ChatMessage } from "@/types/chat.types";
import { HeaderChat } from "@/components/common/chats/header-chat";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

type Params = {
  chatId: string;
  userId: string;
  recieverId?: string;
  profileUrl?: string;
  name?: string;
};

const DEFAULT_USER_IMAGE = require("@/assets/user.png");

const Chats: React.FC = () => {
  const { chatId, name, profileUrl, userId } =
    useLocalSearchParams<Params>() as unknown as Params;
  const currentUserId = userId ?? "";
  const { user } = useUserStore();

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

  /* ---------------- fetch gifts ---------------- */
  useEffect(() => {
    let mounted = true;
    const fetchGifts = async () => {
      try {
        const res = await useGetAllGifts();
        if (!mounted) return;
        console.log(res, "SSS");
        setGifts(res?.data ?? []);
      } catch (err) {
        console.warn("Failed to fetch gifts", err);
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
      console.error("Failed to check wallet:", err);
      setHasMoney(false);
    } finally {
      setCheckingWallet(false);
    }
  }, []);

  useEffect(() => {
    checkWalletBalance();
  }, [checkWalletBalance]);

  /* ---------------- fetch messages ---------------- */
  const fetchMessages = useCallback(async () => {
    try {
      setLoadingMessages(true);
      const res = await useGetChatsPerFriend({ id: chatId });
      setMessages(res?.data ?? []);
    } catch (err) {
      console.warn("Failed to fetch messages", err);
      toast.show({
        title: "Unable to load messages",
        type: "error",
        duration: 2000,
      });
    } finally {
      setLoadingMessages(false);
      setRefreshing(false);
      // scroll after load
      scrollToBottom(false);
    }
  }, [chatId]);

  // refresh when screen focused (implements "refresh every time I go there")
  useFocusEffect(
    useCallback(() => {
      fetchMessages();
      checkWalletBalance();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId])
  );

  useEffect(() => {
    // initial fetch
    if (chatId) fetchMessages();
  }, [chatId, fetchMessages]);

  /* ---------------- setup socket ---------------- */
  useEffect(() => {
    let mounted = true;
    const setup = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.warn("No token available for socket connection");
          return;
        }

        const socket = io(
          process.env.EXPO_PUBLIC_API_URL ||
            "https://z91gp9m2-9999.uks1.devtunnels.ms/chat",
          {
            transports: ["websocket"],
            extraHeaders: { Authorization: `Bearer ${token}` },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true,
          }
        );

        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("✅ Connected to chat server:", socket.id);
        });

        socket.on("error", (data: any) => {
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
        });

        socket.on("private-message", (data: any) => {
          if (!mounted) return;
          const normalized: ChatMessage = {
            id: data?.id?.toString() ?? Date.now().toString(),
            type: data?.type ?? "text",
            content: data?.content ?? data?.message ?? "",
            edited: !!data?.edited,
            deleted: !!data?.deleted,
            fileId: data?.fileId ?? null,
            userId: data?.userId ?? data?.fromUserId ?? "",
            created_at: data?.created_at ?? new Date().toISOString(),
            updated_at: data?.updated_at ?? new Date().toISOString(),
            chatId: chatId ?? "",
            user: data?.user ?? null,
            file: data?.file ?? null,
          };

          setMessages((prev) => [...prev, normalized]);

          // scroll to bottom shortly after new message arrives
          setTimeout(() => scrollToBottom(true), 100);
        });

        socket.on("incoming-call", (data: any) => {
          console.log("Incoming call", data);
          router.push(
            `/ringing?id=${data?.callId}&recipientId=${data?.recipientId}&mode=join`
          );
        });
      } catch (err) {
        console.warn("Socket setup failed", err);
      }
    };

    setup();

    return () => {
      mounted = false;
      const sock = socketRef.current;
      if (sock) {
        sock.off("private-message");
        sock.off("connect");
        sock.off("error");
        sock.disconnect();
      }
      socketRef.current = null;
    };
  }, [chatId]);

  /* ---------------- sort messages ----------------
     announcements first (chronological), then normal messages chronological
  */
  const sortedMessages = useMemo(() => {
    const arr = [...messages];
    const announcements = arr.filter((m) => m.type === "announcement");
    const rest = arr.filter((m) => m.type !== "announcement");

    announcements.sort(
      (a, b) =>
        (new Date(a.created_at).getTime() || 0) -
        (new Date(b.created_at).getTime() || 0)
    );
    rest.sort(
      (a, b) =>
        (new Date(a.created_at).getTime() || 0) -
        (new Date(b.created_at).getTime() || 0)
    );

    return [...announcements, ...rest];
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
      if (!sock || sock.disconnected) {
        toast.show({
          title: "Not connected to chat server.",
          type: "error",
          duration: 2000,
        });
        return;
      }

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
          console.log("uploaded image id:", uploadedFileId);
        }

        // optimistic message to UI
        const optimisticMsg: ChatMessage = {
          id: `local-${Date.now()}`,
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
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        Keyboard.dismiss();

        sock.emit(
          "private-message",
          {
            toUserId: userId,
            message: msg,
            fileId: uploadedFileId,
          },
          // optional ack callback
          (response: any) => {
            // here you can update the optimistic message if server returns full message
            // For now we simply stop the sending state and scroll
            setSending(false);
            scrollToBottom(true);
          }
        );
        setSending(false);
        // fetchMessages();
      } catch (err) {
        console.warn("Send failed", err);
        toast.show({
          title: "Something went wrong while sending.",
          type: "error",
          duration: 2000,
        });
        setSending(false);
      }
    },
    [chatId, currentUserId, userId, sending, hasMoney, user]
  );

  /* ---------------- pull-to-refresh handler ---------------- */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMessages();
  }, [fetchMessages]);

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
      style={{ flex: 1, paddingTop: 20 }}
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
          recipientId={currentUserId}
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
            />
          )}
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
        ) : hasMoney ? (
          <ChatInput
            onSend={handleSend}
            onGiftPress={() => bottomSheetRef.current?.expand()}
            sending={sending}
            // expose the localImage setter so you can set it elsewhere if needed
            setLocalImage={setLocalImage}
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
              Insufficient balance — fund your wallet to chat.
            </ThemedText>
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
}> = ({ item, currentUserId, profileUrl, index = 0 }) => {
  const isMe = item.userId === currentUserId;
  const { user } = useUserStore();

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
        isMe ? styles.otherMessageRow : styles.myMessageRow,
      ]}
    >
      {/* sender avatar on left when sender is me (as requested previously) */}
      {isMe && (
        <Animated.View entering={FadeIn.duration(300).delay(100)}>
          <Image
            source={
              profileUrl && user?.profile_picture?.url
                ? { uri: generateURL({ url: profileUrl }) }
                : DEFAULT_USER_IMAGE
            }
            defaultSource={DEFAULT_USER_IMAGE}
            onError={() => {}}
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

      {!item.file?.url && item?.content && (
        <Animated.View
          entering={FadeIn.duration(300).delay(50)}
          style={[
            styles.messageBubble,
            isMe ? styles.otherMessage : styles.myMessage,
          ]}
        >
          <ThemedText color={isMe ? "#000" : "#fff"}>{item.content}</ThemedText>

          {item.created_at && (
            <ThemedText
              fontSize={8}
              color={isMe ? "#666" : "#eee"}
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
        </Animated.View>
      )}
      {!isMe && (
        <Animated.View entering={FadeIn.duration(300).delay(100)}>
          <Image
            source={
              user
                ? { uri: generateURL({ url: user.profile_picture.url }) }
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
}> = ({ onSend, onGiftPress, sending = false, setLocalImage }) => {
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
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
      console.warn("Image picker error:", err);
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
});

export default Chats;
