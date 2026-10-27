import React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";

export default function VideoCallScreen() {
  const { channel, id, callType, recipientId, chatId, profileUrl, name } =
    useLocalSearchParams<{
    channel?: string;
    id?: string;
    callType?: "audio" | "video";
    recipientId?: string;
    chatId?: string;
    profileUrl?: string;
    name?: string;
  }>();

  return (
    <Redirect
      href={{
        pathname: "/outgoing-call",
        params: {
          id: id ?? channel,
          mode: "join",
          callType: callType ?? "video",
          recipientId,
          chatId,
          profileUrl,
          name,
        },
      }}
    />
  );
}
