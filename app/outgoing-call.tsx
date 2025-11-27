import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useCall } from "@/context/call-provider";
import { OutgoingCallScreen } from "@/components/common/calls/outgoing-call-screen";
import { useGetSingleFriend } from "@/hooks/friend-hooks.hooks";
import { CallingState } from "@stream-io/video-react-native-sdk";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";

export default function OutgoingCallScreenPage() {
  const { recipientId, callType, callId } = useLocalSearchParams<{
    recipientId: string;
    callType: "audio" | "video";
    callId: string;
  }>();
  const { activeCall, client, isInitialized } = useCall();
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientImage, setRecipientImage] = useState<string>("");
  const [call, setCall] = useState<any>(null);

  // Get the call reference
  useEffect(() => {
    if (activeCall?.id === callId) {
      setCall(activeCall);
    } else if (client && callId) {
      const callRef = client.call("default", callId);
      setCall(callRef);
    }
  }, [activeCall, client, callId]);

  // Fetch recipient info
  useEffect(() => {
    const fetchRecipientInfo = async () => {
      if (!recipientId) return;
      try {
        const response = await useGetSingleFriend({ id: recipientId });
        if (response?.data) {
          setRecipientName(
            `${response.data.first_name} ${response.data.last_name}`
          );
          setRecipientImage(response.data.profile_picture?.url || "");
        }
      } catch (error) {
        console.error("Error fetching recipient info:", error);
      }
    };
    fetchRecipientInfo();
  }, [recipientId]);

  // Monitor call state and navigate when joined
  useEffect(() => {
    if (!call || !callId) return;

    let hasNavigated = false;

    const checkCallState = () => {
      try {
        const state = call.state?.callingState;
        const isJoined = state === CallingState.JOINED;

        if (isJoined && !hasNavigated) {
          hasNavigated = true;
          router.replace(`/video-call?channel=${callId}&callType=${callType}`);
        }
      } catch (error) {
        console.error("Error checking call state:", error);
      }
    };

    // Check immediately
    checkCallState();

    // Listen for state changes
    const handleStateChange = () => {
      checkCallState();
    };

    call.on("call.state_changed", handleStateChange);
    call.on("call.session_joined", handleStateChange);

    return () => {
      call.off("call.state_changed", handleStateChange);
      call.off("call.session_joined", handleStateChange);
    };
  }, [call, callId, callType]);

  const handleCancel = () => {
    if (call) {
      call.leave().catch(() => {
        // Ignore errors
      });
    }
    router.back();
  };

  // Show loading state
  if (!call || !client || !isInitialized) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1a1a", justifyContent: "center", alignItems: "center" }}>
        <ThemedText color="#fff" fontSize={18}>Connecting...</ThemedText>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  return (
    <OutgoingCallScreen
      call={call}
      recipientName={recipientName}
      recipientImage={recipientImage}
      callType={callType || "audio"}
      onCancel={handleCancel}
    />
  );
}
