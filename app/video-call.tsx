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

        // Add delay before joining to ensure native modules are ready
        await new Promise(resolve => setTimeout(resolve, 500));

        // Join the call
        const joinedCall = await joinCall(channel, actualCallType);

        if (!joinedCall) {
          throw new Error("Failed to join call");
        }

        // Add small delay before setting call to ensure it's stable
        await new Promise(resolve => setTimeout(resolve, 300));
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

  // Don't render StreamCall until call is fully ready
  if (!call) {
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
  const router = require("expo-router").router;
  const [callReady, setCallReady] = useState(false);

  // Use hooks with error handling
  let call: any = null;
  let callingState: CallingState | null = null;
  let camera: any = null;
  let isCameraEnabled = false;
  let microphone: any = null;
  let isMicrophoneEnabled = false;

  try {
    const { useCallState, useCameraState, useMicrophoneState } = useCallStateHooks();
    const callState = useCallState();
    const cameraState = useCameraState();
    const micState = useMicrophoneState();
    
    call = callState?.call || null;
    callingState = callState?.callingState || null;
    camera = cameraState?.camera || null;
    isCameraEnabled = cameraState?.isCameraEnabled || false;
    microphone = micState?.microphone || null;
    isMicrophoneEnabled = micState?.isMicrophoneEnabled || false;
  } catch (error: any) {
    console.error("Error accessing call state hooks:", error);
    // Return loading state if hooks fail
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing call...</Text>
      </View>
    );
  }

  // Wait for call to be ready
  useEffect(() => {
    if (call && callingState === CallingState.JOINED) {
      // Add delay to ensure native modules are ready
      setTimeout(() => {
        setCallReady(true);
      }, 500);
    } else {
      setCallReady(false);
    }
  }, [call, callingState]);

  const toggleMicrophone = async () => {
    try {
      if (!microphone) {
        console.warn("Microphone not available");
        return;
      }
      if (isMicrophoneEnabled) {
        await microphone.disable();
      } else {
        await microphone.enable();
      }
    } catch (error: any) {
      console.error("Error toggling microphone:", error);
      toast.error("Failed to toggle microphone");
    }
  };

  const toggleCamera = async () => {
    try {
      if (!camera) {
        console.warn("Camera not available");
        return;
      }
      if (isCameraEnabled) {
        await camera.disable();
      } else {
        await camera.enable();
      }
    } catch (error: any) {
      console.error("Error toggling camera:", error);
      toast.error("Failed to toggle camera");
    }
  };

  const endCall = async () => {
    try {
      if (call) {
        await call.leave().catch((err: any) => {
          console.error("Error leaving call:", err);
        });
      }
      router.back();
    } catch (error: any) {
      console.error("Error ending call:", error);
      // Always navigate back even if leave fails
      router.back();
    }
  };

  // Disable camera for audio calls
  useEffect(() => {
    if (isAudioCall && isCameraEnabled && camera) {
      // Add delay to ensure camera is ready
      setTimeout(() => {
        camera.disable().catch((err: any) => {
          console.log("Failed to disable camera for audio call:", err);
          // Ignore errors
        });
      }, 500);
    }
  }, [isAudioCall, isCameraEnabled, camera]);

  if (!call || callingState !== CallingState.JOINED || !callReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          {callingState === CallingState.JOINING ? "Joining..." : callingState === CallingState.RINGING ? "Ringing..." : "Connecting..."}
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
