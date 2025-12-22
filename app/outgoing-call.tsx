import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import {
  Call,
  CallContent,
  StreamCall,
  useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { router, useLocalSearchParams } from "expo-router";

const OutgoingCall = () => {
  const [call, setCall] = useState<Call | null>(null);
  const client = useStreamVideoClient();
  const { id, recipientId, mode } = useLocalSearchParams<{
    id: string;
    recipientId: string;
    mode: "join" | "create";
  }>();

  const isJoin = mode === "join";

  const goBackToChat = () => {
    router.back();
  };

  useEffect(() => {
    if (!client || !id) return;

    const joinCall = async () => {
      console.log("Joining call ", id);
      const newCall = client.call("default", id);
      await newCall.join({ create: isJoin });
      setCall(newCall);
    };

    joinCall();
  }, [client]);

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
