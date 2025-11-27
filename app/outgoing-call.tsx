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
  const { id } = useLocalSearchParams<{ id: string }>();

  const goBackToChat = () => {
    router.back();
  };

  useEffect(() => {
    if (!client || !id || call) return; // <- don't join again

    const joinCall = async () => {
      const newCall = client.call("default", id);
      await newCall.join({
        create: true,
        notify: true,
        members_limit: 2,
        migrating_from: id,
        ring: true,
      });
      setCall(newCall);
    };

    joinCall();
  }, [client, id]);

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
