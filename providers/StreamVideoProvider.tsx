import { useGetTokenCall } from "@/hooks/chats.hooks";
import { useCallStore } from "@/store/call.store";
import { useUserStore } from "@/store/store";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-native-sdk";
import { useEffect, useState, ReactNode } from "react";

export const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const { user: profile } = useUserStore();
  const setCall = useCallStore((state) => state.setCall);

  const [client, setClient] = useState<StreamVideoClient | null>(null);

  // 🔥 Load token from backend
  const loadToken = async () => {
    try {
      const res = await useGetTokenCall();

      if (!res?.token) {
        console.warn("❌ No token returned");
        return null;
      }

      return res.token;
    } catch (e) {
      console.error("TOKEN ERROR", e);
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = await loadToken();
      if (!token) return;

      const apiKey = "psc3ja4nanxg";
      const userId = profile?.id ?? "anonymous_user";

      const videoClient = new StreamVideoClient({
        apiKey,
        user: { id: userId, name: profile?.first_name ?? "User" },
        token,
      });

      setClient(videoClient);
    };

    init();
  }, [profile?.id]);

  if (!client) return null; // Still loading

  return <StreamVideo client={client}>{children}</StreamVideo>;
};
