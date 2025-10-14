import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
} from "react-native";
import { Alarm, Gift as GiftIcon, Send2, Image as ImageIcon, CloseCircle } from "iconsax-react-native";
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
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Gift as Gifts } from "@/types/wallet.types";
import { useGetWallet } from "@/hooks/wallet-hooks.hooks";
import { useGetAllGifts } from "@/hooks/wallet-hooks.hooks";
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

const DEFAULT_USER_IMAGE = require("@/assets/users.jpg");

const Chats: React.FC = () => {
  const { chatId, name, profileUrl, userId } =
    useLocalSearchParams<Params>() as unknown as Params;
  const currentUserId = userId ?? "";
  const { user, updateUser, clearUser } = useUserStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [gifts, setGifts] = useState<Gifts[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const [hasMoney, setHasMoney] = useState(false);
  const [checkingWallet, setCheckingWallet] = useState(true);
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const flatListRef = useRef<FlatList<ChatMessage> | null>(null);
  const [localImage, setLocalImage] = useState(null);

  flatListRef?.current?.scrollToEnd({ animated: true });

  const uploadImage = async () => {
    if (!localImage) {
      // toast({
      //   title: "Please select an image first.",
      //   duration: 2000,
      //   type: "error",
      // });
      return;
    }

    setSending(true);
    // Prepare file object for upload
    const file = {
      uri: localImage,
      name: "profile.jpg",
      type: "image/jpeg",
    };
    try {
      const response = await useUploadService({ file });
      console.log("Upload response:", response);
      // toast({
      //   title: "Image uploaded successfully!",
      //   duration: 2000,
      //   type: "success",
      // });
      // This ID
      console.log(response?.data[0]?.id, "SJSJ");
      setSending(false);
    } catch (error) {
      setSending(false);
      console.log("Upload error:", error);
      // toast({
      //   title: "Image upload failed.",
      //   duration: 2000,
      //   type: "error",
      // });
    }
  };

  /* ---------- Fetch gifts ---------- */
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await useGetAllGifts();
        if (!mounted) return;
        setGifts(res?.data ?? []);
      } catch (err) {
        console.warn("Failed to fetch gifts", err);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const checkWalletBalance = async () => {
      try {
        setCheckingWallet(true);
        const response = await useGetWallet();
        const balance = Number(response?.data?.balance ?? 0);
        if (balance >= 0.5) {
          setHasMoney(true);
        } else {
          setHasMoney(false);
        }
      } catch (err) {
        console.error("Failed to check wallet:", err);
        setHasMoney(false);
      } finally {
        setCheckingWallet(false);
      }
    };

    checkWalletBalance();
  }, []);

  /* ---------- Fetch messages ---------- */
  useEffect(() => {
    let mounted = true;
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await useGetChatsPerFriend({ id: chatId });
        if (!mounted) return;
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
      }
    };

    if (chatId) fetchMessages();

    return () => {
      mounted = false;
    };
  }, [chatId]);

  /* ---------- Setup socket ---------- */
  useEffect(() => {
    let mounted = true;
    const setupSocket = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.warn("No token available for socket connection");
          return;
        }

        const socket = io(
          process.env.EXPO_PUBLIC_API_URL ||
          "https://mi-love-api-production.up.railway.app/chat",
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

          // 🔹 Scroll to bottom when new message arrives
          setTimeout(() => {
            flatListRef?.current?.scrollToEnd({ animated: true });
          }, 100);
        });

      } catch (err) {
        console.warn("Socket setup failed", err);
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      const sock = socketRef.current;
      if (sock) {
        sock.off("private-message");
        sock.disconnect();
      }
      socketRef.current = null;
    };
  }, [chatId]);

  /* ---------- Sort messages ---------- */
  const sortedMessages = useMemo(() => {
    const arr = [...messages];
    const announcements = arr.filter((m) => m.type === "announcement");
    const rest = arr.filter((m) => m.type !== "announcement");

    rest.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    announcements.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return [...announcements, ...rest];
  }, [messages]);

  /* ---------- Send message handler ---------- */
  const handleSend = useCallback(
    async (msg: string, imageUri?: string) => {
      if (!msg.trim() && !imageUri)
        return toast.show({
          title: "Message cannot be empty.",
          type: "error",
          duration: 2000,
        });

      flatListRef?.current?.scrollToEnd({ animated: true });

      if (sending)
        return toast.show({
          title: "Please wait, message sending...",
          type: "info",
          duration: 1500,
        });

      if (!hasMoney)
        return toast.show({
          title: "Insufficient balance — fund your wallet.",
          type: "error",
          duration: 2500,
        });

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

        // 🔹 Upload image if attached
        if (imageUri) {
          const file = {
            uri: imageUri,
            name: "chat_image.jpg",
            type: "image/jpeg",
          };
          const res = await useUploadService({ file });
          uploadedFileId = res?.data?.[0]?.id ?? null;
          uploadedFileUrl = res?.data?.[0]?.url ?? null;
        }

        // 🔹 Prepare optimistic message
        const optimisticMsg: ChatMessage = {
          id: `local-${Date.now()}`,
          type: "text",
          content: msg,
          edited: false,
          deleted: false,
          fileId: uploadedFileId,
          userId: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          chatId: chatId ?? "",
          user: null,
          file: uploadedFileUrl ? { url: uploadedFileUrl } : null,
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        Keyboard.dismiss();

        // 🔹 Emit socket event
        sock.emit(
          "private-message",
          {
            toUserId: userId,
            message: msg,
            fileId: uploadedFileId,
          },
          () => {
            setSending(false);
            flatListRef?.current?.scrollToEnd({ animated: true });
          }
        );
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
    [chatId, currentUserId, userId, sending, hasMoney]
  );


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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={styles.container}>
        <HeaderChat profileUrl={profileUrl ?? ""} name={name ?? "Unknown"} />

        <FlatList
          ref={flatListRef}
          data={sortedMessages}
          keyExtractor={(item) => item.id ?? `${item.created_at ?? Date.now()}`}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <MessageBubble profileUrl={profileUrl} item={item} currentUserId={currentUserId} />
          )}
          ListEmptyComponent={renderEmpty}
          keyboardShouldPersistTaps="handled"
        />

        <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={["25%", "50%"]} enablePanDownToClose>
          <BottomSheetFlatList
            data={gifts}
            keyExtractor={(item) => item.id.toString()}
            numColumns={4}
            contentContainerStyle={{
              paddingBottom: 40,
              paddingTop: 20,
              paddingHorizontal: 20,
            }}
            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 20 }}
            renderItem={({ item }) => <GiftCompo gift={item} receiverId={userId ?? ""} />}
          />
        </BottomSheet>

        {checkingWallet ? (
          <ThemedView justifyContent="center" alignItems="center" padding={20} backgroundColor="#fafafa" borderTopWidth={0.3} borderTopColor="#eee">
            <ActivityIndicator size="small" color={COLORS.primary} />
          </ThemedView>
        ) : hasMoney ? (
          <ChatInput onSend={handleSend} onGiftPress={() => bottomSheetRef.current?.expand()} sending={sending} />
        ) : (
          <ThemedView justifyContent="center" alignItems="center" padding={20} backgroundColor="#fff8f8" borderTopWidth={0.3} borderTopColor="#eee">
            <ThemedText fontSize={14} color="#EF4444" fontWeight="600" textAlign="center">
              Insufficient balance — fund your wallet to chat.
            </ThemedText>
          </ThemedView>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

/* ---------------- Message Bubble ---------------- */
export const MessageBubble: React.FC<{ item: ChatMessage; currentUserId: string; profileUrl?: string }> = ({
  item,
  currentUserId,
  profileUrl,
}) => {
  const isMe = item.userId === currentUserId;
  const { user } = useUserStore();

  if (item.type === "announcement") {
    return (
      <View style={styles.announcementContainer}>
        <Alarm size={18} color={COLORS.primary} variant="Bold" />
        <ThemedText fontSize={14} textAlign="center" color={COLORS.primary} fontWeight="600">
          {item.content}
        </ThemedText>
      </View>
    );
  }


  return (
    <View style={[styles.messageRow, isMe ? styles.otherMessageRow : styles.myMessageRow]}>
      {isMe && (
        <Image source={user?.profile_picture ? { uri: generateURL({ url: user.profile_picture.url }) } : DEFAULT_USER_IMAGE} style={styles.avatar} />
      )}

      <View style={[styles.messageBubble, isMe ? styles.otherMessage : styles.myMessage]}>
        {/* {item.type === "image" && item.file?.url ? (
          <Image source={{ uri: item.file.url }} style={{ width: 180, height: 180, borderRadius: 12, marginBottom: 6 }} />
        ) : null} */}
        <ThemedText color={isMe ? "#000" : "#fff"}>{item.content}</ThemedText>
        {item.created_at && (
          <ThemedText fontSize={6} color={isMe ? "#666" : "#eee"} marginTop={6} alignSelf="flex-end" opacity={0.8}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </ThemedText>
        )}
      </View>

      {!isMe && (
        <Image source={profileUrl ? { uri: generateURL({ url: profileUrl }) } : DEFAULT_USER_IMAGE} style={styles.avatar} />
      )}
{/* 
      {item.type === "" && item.file?.url ? (
        <Image
          source={{ uri: generateURL({ url: item.file.url }) }}
          style={{ width: 180, height: 180, borderRadius: 12, marginBottom: 6 }}
        />
      ) : null} */}

    </View>
  );
};

/* ---------------- Chat Input (with image upload + preview) ---------------- */
const ChatInput: React.FC<{
  onSend: (msg: string, imageUri?: string) => void;
  onGiftPress: () => void;
  sending?: boolean;
}> = ({ onSend, onGiftPress, sending = false }) => {
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
  };

  return (
    <ThemedView
      flexDirection="column"
      borderTopWidth={0.3}
      borderTopColor="#eee"
      backgroundColor="#fafafa"
      padding={10}
      gap={6}
    >
      {/* 🔹 Image preview section */}
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
            onPress={() => setImageUri(null)}
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

      {/* 🔹 Input Row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <ChatPanicButton />

        <TouchableOpacity
          onPress={pickImage}
          accessibilityLabel="Upload image"
          style={{
            backgroundColor: "#fff",
            borderWidth: 0.3,
            borderColor: "#ddd",
            padding: 10,
            borderRadius: 50,
          }}
        >
          <ImageIcon size={20} color={COLORS.primary} />
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
  container: { flex: 1, backgroundColor: "#fff" },
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
