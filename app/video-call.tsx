import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { StyleSheet, View, TouchableOpacity, StatusBar, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCall } from "@/context/call-provider";
import {
  StreamCall,
  CallContent,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import { COLORS } from "@/config/theme";
import { ArrowLeft2, CallSlash, Microphone2, MicrophoneSlash, Video, VideoSlash } from "iconsax-react-native";
import { requestCallPermissions, requestMicrophonePermission } from "@/utils/permissions-utils.utils";
import { toast } from "@/components/lib/toast-manager";

export default function VideoCallScreen() {
  const { channel, callType } = useLocalSearchParams<{
    channel: string;
    callType?: "audio" | "video";
  }>();
  const { joinCall, client, isInitialized } = useCall();
  const [call, setCall] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const actualCallType = callType || (channel?.startsWith("video-") ? "video" : "audio");
  const isAudioCall = actualCallType === "audio";

  useEffect(() => {
    if (!channel || !client || !isInitialized) {
      setError("Call service not ready");
      setIsLoading(false);
      return;
    }

    const setupCall = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Request permissions
        try {
          if (isAudioCall) {
            await requestMicrophonePermission(false);
          } else {
            await requestCallPermissions(false);
          }
        } catch (permError) {
          console.log("Permission request failed, continuing:", permError);
        }

        // Join the call
        const joinedCall = await joinCall(channel, actualCallType);

        if (!joinedCall) {
          throw new Error("Failed to join call");
        }

        setCall(joinedCall);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error setting up call:", err);
        setError(err?.message || "Failed to connect to call");
        setIsLoading(false);
        toast.error("Failed to connect to call");
        setTimeout(() => router.back(), 2000);
      }
    };

    setupCall();

    return () => {
      if (call) {
        call.leave().catch((err: any) => {
          console.log("Error leaving call on unmount:", err);
        });
      }
    };
  }, [channel, client, isInitialized, actualCallType, isAudioCall]);

  if (isLoading || !call) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {error || "Connecting to call..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <StreamCall call={call}>
        <CallUI isAudioCall={isAudioCall} />
      </StreamCall>
    </SafeAreaView>
  );
}

// Call UI component
function CallUI({ isAudioCall }: { isAudioCall: boolean }) {
  const { useCallState, useCameraState, useMicrophoneState } = useCallStateHooks();
  const { call, callingState } = useCallState();
  const { camera, isCameraEnabled } = useCameraState();
  const { microphone, isMicrophoneEnabled } = useMicrophoneState();
  const router = require("expo-router").router;

  const toggleMicrophone = async () => {
    try {
      if (isMicrophoneEnabled) {
        await microphone.disable();
      } else {
        await microphone.enable();
      }
    } catch (error) {
      console.error("Error toggling microphone:", error);
    }
  };

  const toggleCamera = async () => {
    try {
      if (isCameraEnabled) {
        await camera.disable();
      } else {
        await camera.enable();
      }
    } catch (error) {
      console.error("Error toggling camera:", error);
    }
  };

  const endCall = async () => {
    try {
      await call.leave();
      router.back();
    } catch (error) {
      console.error("Error ending call:", error);
      router.back();
    }
  };

  // Disable camera for audio calls
  useEffect(() => {
    if (isAudioCall && isCameraEnabled && camera) {
      camera.disable().catch(() => {
        // Ignore errors
      });
    }
  }, [isAudioCall, isCameraEnabled, camera]);

  if (callingState !== CallingState.JOINED) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          {callingState === CallingState.JOINING ? "Joining..." : "Connecting..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.callContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={endCall}>
          <ArrowLeft2 color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isAudioCall ? "Audio Call" : "Video Call"}
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <CallContent />
      </View>

      <View style={styles.controls}>
        {!isAudioCall && (
          <TouchableOpacity
            style={[styles.controlButton, !isCameraEnabled && styles.controlButtonDisabled]}
            onPress={toggleCamera}
          >
            {isCameraEnabled ? (
              <Video color="#FFFFFF" size={24} />
            ) : (
              <VideoSlash color="#FFFFFF" size={24} />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.controlButton, !isMicrophoneEnabled && styles.controlButtonDisabled]}
          onPress={toggleMicrophone}
        >
          {isMicrophoneEnabled ? (
            <Microphone2 color="#FFFFFF" size={24} />
          ) : (
            <MicrophoneSlash color="#FFFFFF" size={24} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={endCall}
        >
          <CallSlash color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 16,
  },
  callContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonDisabled: {
    backgroundColor: "rgba(255, 0, 0, 0.5)",
  },
  endCallButton: {
    backgroundColor: "#FF3B30",
  },
});
