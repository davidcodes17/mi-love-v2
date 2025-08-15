import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  VideoSourceType,
  ChannelProfileType,
  ClientRoleType,
} from 'react-native-agora';

import { useRouter } from 'expo-router';

const appId = 'b61ffc424d4d4f74af4c240a14b12072'; // 🔁 Replace with your actual Agora App ID
const channelName = 'testChannel'; // 🔁 Use a dynamic channel name if needed
const token = ""; // 🔐 Replace with a valid token in production

const CallScreen = () => {
  const [engine, setEngine] = useState<IRtcEngine>();
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      if (Platform.OS === 'android') {
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
        onJoinChannelSuccess: () => {
          console.log('Joined channel successfully');
          setJoined(true);
        },
        onUserJoined: (uid:any) => {
          console.log('Remote user joined:', uid);
          setRemoteUid(uid);
        },
        onUserOffline: (uid) => {
          console.log('Remote user left:', uid);
          setRemoteUid(null);
        },
      });

      rtc.joinChannel(token, channelName, 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });

      setEngine(rtc);
    };

    init();

    return () => {
      if (engine) {
        engine.leaveChannel();
        engine.release();
      }
    };
  }, []);

  const handleEndCall = () => {
    if (engine) {
      engine.leaveChannel();
      engine.release();
      setEngine(undefined);
      setJoined(false);
      setRemoteUid(null);
      router.back(); // 🔙 Navigate back after ending the call
    }
  };

  return (
    <View style={styles.container}>
      {!joined && <Text style={styles.text}>Joining the call...</Text>}

      {joined && (
        <RtcSurfaceView
          style={styles.local}
          canvas={{ uid: 0, sourceType: VideoSourceType.VideoSourceCamera }}
        />
      )}

      {remoteUid !== null && (
        <RtcSurfaceView
          style={styles.remote}
          canvas={{ uid: remoteUid }}
        />
      )}

      {joined && (
        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <Text style={styles.endCallText}>End Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CallScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  local: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  remote: {
    width: 120,
    height: 160,
    position: 'absolute',
    top: 30,
    right: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  endCallButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  endCallText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: { color: '#fff', textAlign: 'center', marginTop: 100 },
});
