import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";

let chatSocket: Socket | null = null;
let pendingSocket: Promise<Socket | null> | null = null;

const chatSocketUrl = () => {
  // const api = (process.env.EXPO_PUBLIC_API_URL || "https://mi-love-api.onrender.com")
  const api = (process.env.EXPO_PUBLIC_API_URL || "https://ft0gnb2q-9999.uks1.devtunnels.ms")
    .replace(/\/+$/, "");
  return `${api}/chat`;
};

export const getChatSocket = async (): Promise<Socket | null> => {
  if (chatSocket) {
    if (!chatSocket.connected) chatSocket.connect();
    return chatSocket;
  }
  if (pendingSocket) return pendingSocket;

  pendingSocket = (async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return null;

    const authorization = `Bearer ${token}`;
    chatSocket = io(chatSocketUrl(), {
      transports: ["websocket"],
      auth: {
        token: authorization,
        authorization,
      },
      extraHeaders: {
        Authorization: authorization,
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });
    return chatSocket;
  })().finally(() => {
    pendingSocket = null;
  });

  return pendingSocket;
};

export const disconnectChatSocket = () => {
  chatSocket?.disconnect();
  chatSocket = null;
  pendingSocket = null;
};
