import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
} from "react-native";
import {
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  VideoSourceType,
  ChannelProfileType,
  ClientRoleType,
} from "react-native-agora";
import { useLocalSearchParams, useRouter } from "expo-router";

const appId = "b61ffc424d4d4f74af4c240a14b12072"; // Replace with your App ID
const token = "null"; // Use real token in production

const VideoCallScreen = () => {
  const [engine, setEngine] = useState<IRtcEngine>();
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const router = useRouter();
  const { channel } = useLocalSearchParams();

  useEffect(() => {
    const init = async () => {
      if (Platform.OS === "android") {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
      }

      const rtc = createAgoraRtcEngine();
      rtc.initialize({
        appId,
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });

      rtc.enableVideo();
      rtc.startPreview();

      rtc.registerEventHandler({
        onJoinChannelSuccess: () => setJoined(true),
        onUserJoined: (uid: any) => setRemoteUid(uid),
        onUserOffline: () => setRemoteUid(null),
      });

      rtc.joinChannel(token, String(channel), 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });

      setEngine(rtc);
    };

    init();

    return () => {
      engine?.leaveChannel();
      engine?.release();
    };
  }, []);

  const handleEndCall = () => {
    engine?.leaveChannel();
    engine?.release();
    router.back();
  };

  return (
    <View style={styles.container}>
      {!joined && <Text style={styles.text}>Connecting to call...</Text>}

      {joined && (
        <RtcSurfaceView
          style={styles.local}
          canvas={{ uid: 0, sourceType: VideoSourceType.VideoSourceCamera }}
        />
      )}

      {remoteUid !== null && (
        <RtcSurfaceView style={styles.remote} canvas={{ uid: remoteUid }} />
      )}

      {joined && (
        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <Text style={styles.endCallText}>End Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  local: { width: "100%", height: "100%", position: "absolute" },
  remote: {
    width: 120,
    height: 160,
    position: "absolute",
    top: 40,
    right: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  endCallButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  endCallText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  text: {
    color: "#fff",
    textAlign: "center",
    marginTop: 100,
    fontSize: 16,
  },
});
