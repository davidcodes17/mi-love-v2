import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  CallingState,
  IncomingCall,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useCalls,
  useCallStateHooks,
  User,
  useCall as useStreamCall,
} from "@stream-io/video-react-native-sdk";
import { useUserStore } from "@/store/store";
import { Alert } from "react-native";

// Import Call type
import type { Call } from "@stream-io/video-react-native-sdk";

interface CallContextType {
  client: StreamVideoClient | null;
  createCall: (userId: string, callType?: string) => Promise<Call | undefined>;
  joinCall: (callId: string, callType?: string) => Promise<Call | undefined>;
}

const callContext = createContext<CallContextType>({
  client: null,
  createCall: async () => undefined,
  joinCall: async () => undefined,
});

// GetStream API key and token
const apiKey = "mmhfdzb5evj2";
// These tokens need to be properly signed with the API secret in a production environment
// The tokens below are just examples and may not be valid
const userTokens: Record<string, string> = {
  user1:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcjEifQ.W4x-FSYSxEpzvV4s2lCrWp8O3YmYMSOGLaXZwAzp26s",
  user2:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcjIifQ.1j31hu5jOeclEczJxDBJ2rlr-s7Wac9FtiwMsGd-cOw",
};

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const { user: userStore } = useUserStore();
  // Setup user for GetStream
  const user: User = {
    id: userStore?.username == "areegbedavid" ? "user1" : "user2", // Use hardcoded test user to match the token
    name: userStore?.username || "Guest User",
    image: userStore?.profile_picture?.url,
  };

  useEffect(() => {
    // Only initialize if we have a user
    if (!userStore?.id) {
      console.log("No user available for call initialization");
      return;
    }

    try {
      // Get token based on user ID
      const token = userTokens[user.id];

      if (!token) {
        console.error("No valid token for user:", user.id);
        return;
      }

      console.log(
        "Initializing client for:",
        user.id,
        "with token available:",
        !!token
      );

      const myClient = StreamVideoClient.getOrCreateInstance({
        apiKey,
        user,
        token, // Use token from our tokens object
        options: {
          rejectCallWhenBusy: true, // Automatically reject calls when user is busy
          logLevel: "debug", // Increase log level for debugging
        },
      });

      setClient(myClient);
      console.log("GetStream video client initialized for user:", user.id);

      // Set up event handlers for debugging connection issues
      const connectionChangedHandler = (event: any) => {
        console.log("Connection state changed:", event.type, event.online);
      };

      const connectionErrorHandler = (event: any) => {
        console.error("Connection error:", event);
      };

      myClient.on("connection.changed", connectionChangedHandler);
      myClient.on("connection.error", connectionErrorHandler);

      return () => {
        // Clean up listeners and disconnect
        myClient.off("connection.changed", connectionChangedHandler);
        myClient.off("connection.error", connectionErrorHandler);
        myClient.disconnectUser();
        setClient(null);
      };
    } catch (error) {
      console.error("Error initializing GetStream client:", error);
      Alert.alert("Error", "Failed to initialize video call service");
    }
  }, [userStore?.id]);

  // Access current call
  const call = useStreamCall();
  const isCallCreatedByMe = !!call?.isCreatedByMe;
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  // Create call function
  const createCall = async (userId: string, callType: string = "default") => {
    try {
      if (!client) {
        console.error("Client not initialized");
        Alert.alert("Error", "Call service not ready yet. Please try again.");
        return;
      }

      // Use a consistent call ID format with timestamp for uniqueness
      const callId = `call-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      console.log("Creating call with ID:", callId, "for user:", userId);

      // Get the call instance
      const call = client.call(callType, callId);

      // Create the call with members - make sure to use the correct user IDs
      const result = await call.getOrCreate({
        data: {
          members: [
            // Add the recipient
            { user_id: userId },
          ],
          custom: {
            callInitiator: user.id, // Use the authenticated user's ID
            type: "audio",
          },
        },
      });

      console.log("Call created successfully:", callId);
      return call;
    } catch (error) {
      console.error("Error creating call:", error);
      Alert.alert("Call Failed", "Unable to start call at this time");
    }
  };

  // Join call function
  const joinCall = async (callId: string, callType: string = "default") => {
    try {
      if (!client) {
        console.error("Client not initialized");
        Alert.alert("Error", "Call service not ready yet. Please try again.");
        return;
      }

      console.log("Joining call with ID:", callId, "as user:", user.id);

      try {
        const call = client.call(callType, callId);

        // Get or create the call - which will join it
        await call.getOrCreate();
        console.log("Call joined successfully:", callId);

        return call;
      } catch (innerError) {
        console.error("Error in call.getOrCreate:", innerError);

        // Try to query the call first to see if it exists
        const calls = await client.queryCalls({
          filter_conditions: {
            id: callId,
          },
        });

        if (calls.calls.length > 0) {
          console.log("Call found via query, trying to join");
          const existingCall = client.call(callType, callId);
          await existingCall.join();
          return existingCall;
        } else {
          throw new Error("Call not found");
        }
      }
    } catch (error) {
      console.error("Error joining call:", error);
      Alert.alert("Call Failed", "Unable to join call at this time");
    }
  };

  if (!client) return children;

  // Show incoming call UI when receiving a call
  if (callingState === CallingState.RINGING && !isCallCreatedByMe) {
    return <IncomingCall />;
  }

  return (
    <callContext.Provider value={{ client, createCall, joinCall }}>
      <StreamVideo client={client}>
        <InternalStreamCall>{children}</InternalStreamCall>
      </StreamVideo>
    </callContext.Provider>
  );
};

/*
INTERNAL COMP REF
*/
const InternalStreamCall = ({ children }: { children: ReactNode }) => {
  const calls = useCalls();
  return calls.length > 0 ? (
    <StreamCall call={calls[0]}>{children}</StreamCall>
  ) : (
    <>{children}</>
  );
};

export const useCall = () => {
  const context = useContext(callContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};
