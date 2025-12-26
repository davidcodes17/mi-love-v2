import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import {
  getAllChatFriends,
  getChatsPerFriend,
} from "@/services/chats-service.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useGetAllChats = async () => {
  const response = await getAllChatFriends();
  return response;
};

let socket: any;

export const useChatSocket = (
  userId: string,
  onMessage: (msg: any) => void
) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      try {

        console.log(" codeeeee")
        const token = await AsyncStorage.getItem("token"); // 👈 get stored token

        const socket = io(
          process.env.EXPO_PUBLIC_API_URL || 
            "https://ttznxdxb-9999.uks1.devtunnels.ms",
          {
            transports: ["websocket"],
            query: { userId },
            auth: {
              token: token ? `Bearer ${token}` : "", // 👈 attach Bearer token
            },
          }
        );

        console.log(" codeeeeesss")

        socketRef.current = socket;

        // Listen for new messages
        socket.on("chat:new_message", onMessage);
        console.log(" codeeeeezzzzzzzzz")

        socket.on("connect_error", (err) => {
          console.log("Socket connection error:", err.message);
        });
      } catch (err) {
        console.error("Failed to init socket", err);
      }
    };

    initSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);

  const sendMessage = (chatId: string, msg: string) => {
    socketRef.current?.emit("private-message", {
      message: msg,
      toUserId: userId,
    });
  };

  return { sendMessage };
};

export const useGetChatsPerFriend = async ({ id }: { id: string }) => {
  const response = await getChatsPerFriend({ id });
  return response;
};
