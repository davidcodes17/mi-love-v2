import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import {
  Call,
  CallContent,
  StreamCall,
  useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { Href, router, useLocalSearchParams } from "expo-router";

const OutgoingCall = () => {
  const [call, setCall] = useState<Call | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const client = useStreamVideoClient();
  const { id, recipientId, mode, chatId, profileUrl, name } = useLocalSearchParams<{
    id: string;
    recipientId: string;
    mode: "join" | "create";
    chatId: string;
    profileUrl: string;
    name: string;
  }>();

  const isJoin = mode === "join";

  const goBackToChat = async () => {
    // Properly leave the call before navigating away
    if (call) {
      try {
        await call.leave();
        console.log("Left call successfully");
      } catch (error) {
        console.error("Error leaving call:", error);
      }
    }
    
    // Route back to chat with all parameters
    router.push({
      pathname: "/(chats)/chats",
      params: {
        chatId: chatId,
        userId: recipientId,
        profileUrl: profileUrl,
        name: name,
      },
    } as any);
  };

  useEffect(() => {
    if (!client || !id || isJoining || call) return;

    let isMounted = true;
    let callInstance: Call | null = null;

    const joinCall = async () => {
      try {
        setIsJoining(true);
        console.log("Joining call ", id, "mode:", mode);
        const newCall = client.call("default", id);
        callInstance = newCall;
        
        // If mode is "create", we need to create and join the call (initiator)
        // If mode is "join", we just join an existing call (receiver)
        await newCall.join({ create: !isJoin });
        
        if (isMounted) {
          setCall(newCall);
          setIsJoining(false);
        }
      } catch (error) {
        console.error("Error joining call:", error);
        if (isMounted) {
          setIsJoining(false);
        }
      }
    };

    joinCall();

    return () => {
      isMounted = false;
      // Leave call on unmount to prevent duplicates
      if (callInstance) {
        callInstance.leave().then(() => {
          console.log("Cleanup: Left call on unmount");
        }).catch((err) => {
          console.error("Cleanup error:", err);
        });
      }
    };
  }, [client, id, mode]);

  if (!call) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text>Joining call...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StreamCall call={call}>
        <CallContent onHangupCallHandler={goBackToChat} />
      </StreamCall>
    </View>
  );
};

export default OutgoingCall;

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
