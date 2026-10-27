import { useEffect, useRef, useState } from "react";
import {
  getAllChatFriends,
  getChatsPerFriend,
} from "@/services/chats-service.service";
import { getChatSocket } from "@/services/chat-socket.service";

export const useGetAllChats = async () => {
  const response = await getAllChatFriends();
  return response;
};

export const useChatSocket = (
  userId: string,
  onMessage: (msg: any) => void
) => {
  const socketRef = useRef<Awaited<ReturnType<typeof getChatSocket>>>(null);

  useEffect(() => {
    const initSocket = async () => {
      try {

        const socket = await getChatSocket();
        if (!socket) return;
        socketRef.current = socket;

        socket.on("private-message", onMessage);
        socket.on("chat-message", onMessage);

        socket.on("connect_error", (err) => {
        });
      } catch (err) {
      }
    };

    initSocket();

    return () => {
      socketRef.current?.off("private-message", onMessage);
      socketRef.current?.off("chat-message", onMessage);
    };
  }, [userId, onMessage]);

  const sendMessage = (chatId: string, msg: string) => {
    socketRef.current?.emit("private-message", {
      message: msg,
      toUserId: userId,
    });
  };

  return { sendMessage };
};

export const useGetChatsPerFriend = async ({
  id,
  page,
  limit,
}: {
  id: string;
  page?: number;
  limit?: number;
}) => {
  const response = await getChatsPerFriend({ id, page, limit });
  return response;
};
