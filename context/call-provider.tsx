import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  CallingState,
  StreamVideo,
  StreamVideoClient,
  useCalls,
  User,
} from "@stream-io/video-react-native-sdk";
import { useUserStore } from "@/store/store";
import { getStreamToken } from "@/services/stream-service.service";
import type { Call } from "@stream-io/video-react-native-sdk";
import { getChatSocket } from "@/services/chat-socket.service";
import { router } from "expo-router";

interface CallContextType {
  client: StreamVideoClient | null;
  createCall: (userId: string, callType?: "audio" | "video") => Promise<Call | undefined>;
  joinCall: (callId: string, callType?: "audio" | "video") => Promise<Call | undefined>;
  activeCall: Call | null;
  callState: CallingState | null;
  isInitialized: boolean;
}

const CallContext = createContext<CallContextType>({
  client: null,
  createCall: async () => undefined,
  joinCall: async () => undefined,
  activeCall: null,
  callState: null,
  isInitialized: false,
});

// GetStream API key
const API_KEY = "jm2dt86gx2h8";

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callState, setCallState] = useState<CallingState | null>(null);
  const { user: userStore } = useUserStore();

  // Initialize Stream client
  useEffect(() => {
    if (!userStore?.id) {
      return;
    }

    let mounted = true;
    let streamClient: StreamVideoClient | null = null;

    const initialize = async () => {
      try {

        // Fetch token
        const tokenResponse = await getStreamToken();
        if (!tokenResponse?.token) {
          return;
        }

        if (!mounted) return;

        // Create user object
        const user: User = {
          id: userStore.id,
          name: userStore.username || `${userStore.first_name || ""} ${userStore.last_name || ""}`.trim() || "User",
          image: userStore.profile_picture?.url,
        };

        // Initialize client
        streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey: API_KEY,
          user,
          token: tokenResponse.token,
          options: {
            logLevel: "info",
          },
        });

        if (!mounted) {
          streamClient.disconnectUser();
          return;
        }

        setClient(streamClient);
        setIsInitialized(true);
      } catch (error) {
        if (mounted) {
          setIsInitialized(false);
        }
      }
    };

    // Small delay to ensure user store is ready
    const timer = setTimeout(initialize, 500);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (streamClient) {
        try {
          streamClient.disconnectUser();
        } catch (error) {
        }
      }
    };
  }, [userStore?.id]);

  useEffect(() => {
    if (!userStore?.id) return;
    let mounted = true;
    let onCall: ((payload: any) => void) | undefined;

    getChatSocket().then((socket) => {
      if (!socket || !mounted) return;
      onCall = (event: any) => {
        const payload = event?.data ?? event;
        const senderId =
          payload?.fromUserId ?? payload?.senderId ?? payload?.userId;
        if (
          !payload?.callId ||
          !senderId ||
          senderId === userStore.id ||
          (payload?.toUserId && payload.toUserId !== userStore.id)
        ) {
          return;
        }
        router.push({
          pathname: "/ringing",
          params: {
            id: payload.callId,
            recipientId: senderId,
            callType: payload.callType ?? "audio",
            chatId: payload.chatId,
            mode: "join",
          },
        });
      };
      socket.on("call", onCall);
    });

    return () => {
      mounted = false;
      getChatSocket().then((socket) => {
        if (socket && onCall) socket.off("call", onCall);
      });
    };
  }, [userStore?.id]);

  // Create a call
  const createCall = useCallback(async (
    userId: string,
    callType: "audio" | "video" = "audio"
  ): Promise<Call | undefined> => {
    if (!client) {
      return undefined;
    }

    if (!userId) {
      return undefined;
    }

    try {
      const callId = `${callType}-call-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const call = client.call("default", callId);

      await call.getOrCreate({
        data: {
          members: [{ user_id: userId }],
          custom: {
            type: callType,
            callInitiator: userStore?.id,
          },
        },
      });

      return call;
    } catch (error: any) {
      return undefined;
    }
  }, [client, userStore?.id]);

  // Join a call
  const joinCall = useCallback(async (
    callId: string,
    callType: "audio" | "video" = "audio"
  ): Promise<Call | undefined> => {
    if (!client) {
      return undefined;
    }

    if (!callId) {
      return undefined;
    }

    try {

      // Add delay to ensure native modules are ready
      await new Promise(resolve => setTimeout(resolve, 500));

      const call = client.call("default", callId);

      // Validate call object
      if (!call) {
        return undefined;
      }

      // Try to get the call first
      try {
        await call.get();
      } catch (error) {
        // Call doesn't exist, this shouldn't happen for outgoing calls
        // but we'll handle it gracefully
        // Don't create it, just try to join
      }

      // Add another delay before joining to ensure native module is ready
      await new Promise(resolve => setTimeout(resolve, 300));

      // Join the call with defensive error handling
      try {
        await call.join({
          create: false,
        });
        return call;
      } catch (joinError: any) {
        // Don't throw, just return undefined
        return undefined;
      }
    } catch (error: any) {
      return undefined;
    }
  }, [client]);

  // If client is not initialized, return context without StreamVideo wrapper
  if (!client || !isInitialized) {
    return (
      <CallContext.Provider
        value={{
          client: null,
          createCall,
          joinCall,
          activeCall: null,
          callState: null,
          isInitialized: false,
        }}
      >
        {children}
      </CallContext.Provider>
    );
  }

  // Client is ready, wrap with StreamVideo
  return (
    <CallContext.Provider
      value={{
        client,
        createCall,
        joinCall,
        activeCall,
        callState,
        isInitialized: true,
      }}
    >
      <StreamVideo client={client}>
        <CallStateManager
          setActiveCall={setActiveCall}
          setCallState={setCallState}
        >
          {children}
        </CallStateManager>
      </StreamVideo>
    </CallContext.Provider>
  );
};

// Internal component to manage call state
const CallStateManager = ({
  children,
  setActiveCall,
  setCallState,
}: {
  children: ReactNode;
  setActiveCall: (call: Call | null) => void;
  setCallState: (state: CallingState | null) => void;
}) => {
  const calls = useCalls();
  const activeCall = calls.length > 0 ? calls[0] : null;
  const callingState = activeCall?.state?.callingState || null;

  useEffect(() => {
    setActiveCall(activeCall || null);
    setCallState(callingState);
  }, [activeCall, callingState, setActiveCall, setCallState]);

  return <>{children}</>;
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};
