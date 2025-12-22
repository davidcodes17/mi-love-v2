import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { generateURL } from "@/utils/image-utils.utils";
import { router } from "expo-router";
import { ArrowLeft2, Call, Video } from "iconsax-react-native";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { ChatMessage } from "@/types/chat.types";
import { useUserStore } from "@/store/store";
import toast from "@/components/lib/toast-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";

export const HeaderChat = ({
  profileUrl,
  name,
  message,
  recipientId,
}: {
  name?: string;
  profileUrl: string;
  message: ChatMessage;
  recipientId?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const theme = useTheme();
  const { user } = useUserStore();

  const socketRef = useRef<Socket | null>(null);

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
          toast.show({
            title: data?.message || "Socket error",
            type: "error",
            duration: 2000,
          });
          if (data?.message === "Insufficient balance to send message.") {
            toast.show({
              title: "Insufficient balance to send message.",
              type: "error",
              duration: 4000,
            });
          }
        });

        socket.on("call", (data: any) => {
          console.log("Call started", data);
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
  }, []);

  const imageSource =
    imageError || !profileUrl
      ? require("@/assets/user.png")
      : { uri: generateURL({ url: profileUrl }) };

  // Generate a deterministic 1:1 call ID
  const generateCallId = (userId: string, recipientId: string) => {
    return [userId, recipientId].sort().join("-");
  };

  const callId = generateCallId(user?.id || "", recipientId || "");

  const handleCallPress = () => {
    const sock = socketRef.current;
    if (!sock || sock.disconnected) {
      toast.show({
        title: "Not connected to chat server.",
        type: "error",
        duration: 2000,
      });
      return;
    }

    sock.emit(
      "call",
      {
        toUserId: recipientId,
        callId: callId,
      },
      // optional ack callback
      (response: any) => {
        console.log("Call started", response);
      }
    );
    console.log("Call started ......");
    router.push(
      `/outgoing-call?id=${callId}&recipientId=${recipientId}&mode=create`
    );
  };

  return (
    <ThemedView
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={12}
      paddingVertical={10}
      borderBottomWidth={0.2}
      borderBottomLeftRadius={20}
      borderBottomRightRadius={20}
      borderBottomColor="#eee"
    >
      {/* Left: Back + User Info */}
      <ThemedView flexDirection="row" alignItems="center" flexShrink={1}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 10 }}
        >
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

      {/* Right: Call & Video */}
      <ThemedView flexDirection="row" alignItems="center" gap={10}>
        <TouchableOpacity onPress={handleCallPress}>
          <Call color={COLORS.primary} size={28} variant="Broken" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCallPress}>
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
