import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCall } from "@/context/call-provider";
import { router } from "expo-router";
import { Call, Video, ArrowLeft2 } from "iconsax-react-native";
import { COLORS } from "@/config/theme";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { useUserStore } from "@/store/store";
import {
  requestMicrophonePermission,
  requestCallPermissions,
} from "@/utils/permissions-utils.utils";
import { toast } from "@/components/lib/toast-manager";

export default function TestCallScreen() {
  const [recipientId, setRecipientId] = useState("");
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const { client, createCall, activeCall, callState } = useCall();
  const { user } = useUserStore();

  // Request permissions immediately when the page opens
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        console.log("TestCallScreen: Requesting permissions on mount...");
        
        // Request microphone permission (needed for both audio and video calls)
        const micGranted = await requestMicrophonePermission(true);
        setMicPermissionGranted(micGranted);
        console.log("TestCallScreen: Microphone permission:", micGranted);
        
        // Wait a bit before requesting camera permission
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Request camera permission (needed for video calls)
        const permissions = await requestCallPermissions(true);
        setCameraPermissionGranted(permissions.camera);
        console.log("TestCallScreen: Camera permission:", permissions.camera);
        
        setPermissionsRequested(true);
        
        if (!micGranted) {
          toast.error("Microphone permission is required for calls");
        }
        if (!permissions.camera) {
          toast.error("Camera permission is required for video calls");
        }
      } catch (error) {
        console.error("TestCallScreen: Error requesting permissions:", error);
        setPermissionsRequested(true);
        // Continue anyway - permissions might be handled by WebRTC SDK
      }
    };

    requestPermissions();
  }, []);

  const handleAudioCall = async () => {
    if (!recipientId.trim()) {
      toast.error("Please enter a recipient ID");
      return;
    }

    if (!client) {
      toast.error("Call service not ready yet");
      return;
    }

    // Check if permissions were already requested
    if (!permissionsRequested) {
      toast.error("Please wait for permissions to be requested");
      return;
    }

    // Check if microphone permission is granted
    if (!micPermissionGranted) {
      toast.error("Microphone permission is required for audio calls");
      Alert.alert(
        "Permission Required",
        "Microphone access is required to make audio calls. Please enable it in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Request Again",
            onPress: async () => {
              const granted = await requestMicrophonePermission(true);
              setMicPermissionGranted(granted);
              if (granted) {
                // Retry the call
                handleAudioCall();
              }
            },
          },
        ]
      );
      return;
    }

    try {
      console.log("Microphone permission already granted, proceeding with call...");
      console.log(`Testing audio call with recipient: ${recipientId}`);
      const call = await createCall(recipientId, "audio");

      if (call) {
        console.log("Audio call created:", call.id);
        // Navigate directly to video-call screen which will handle joining
        // This avoids native module crashes from double-joining
        setTimeout(() => {
          router.push(
            `/video-call?channel=${call.id}&callType=audio`
          );
        }, 500);
      } else {
        toast.error("Unable to create call");
      }
    } catch (error) {
      console.error("Error creating audio call:", error);
      toast.error("Failed to create audio call");
    }
  };

  const handleVideoCall = async () => {
    if (!recipientId.trim()) {
      toast.error("Please enter a recipient ID");
      return;
    }

    if (!client) {
      toast.error("Call service not ready yet");
      return;
    }

    // Check if permissions were already requested
    if (!permissionsRequested) {
      toast.error("Please wait for permissions to be requested");
      return;
    }

    // Check if both permissions are granted
    if (!micPermissionGranted || !cameraPermissionGranted) {
      const missingPermissions = [];
      if (!micPermissionGranted) missingPermissions.push("Microphone");
      if (!cameraPermissionGranted) missingPermissions.push("Camera");
      
      toast.error(`${missingPermissions.join(" and ")} permission${missingPermissions.length > 1 ? "s are" : " is"} required for video calls`);
      Alert.alert(
        "Permission Required",
        `${missingPermissions.join(" and ")} access ${missingPermissions.length > 1 ? "are" : "is"} required to make video calls. Please enable ${missingPermissions.length > 1 ? "them" : "it"} in your device settings.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Request Again",
            onPress: async () => {
              const permissions = await requestCallPermissions(true);
              setMicPermissionGranted(permissions.microphone);
              setCameraPermissionGranted(permissions.camera);
              if (permissions.camera && permissions.microphone) {
                // Retry the call
                handleVideoCall();
              }
            },
          },
        ]
      );
      return;
    }

    try {
      console.log("Camera and microphone permissions already granted, proceeding with call...");
      console.log(`Testing video call with recipient: ${recipientId}`);
      const call = await createCall(recipientId, "video");

      if (call) {
        console.log("Video call created:", call.id);
        // Navigate directly to video-call screen which will handle joining
        // This avoids native module crashes from double-joining
        setTimeout(() => {
          router.push(
            `/video-call?channel=${call.id}&callType=video`
          );
        }, 500);
      } else {
        toast.error("Unable to create call");
      }
    } catch (error) {
      console.error("Error creating video call:", error);
      toast.error("Failed to create video call");
    }
  };

  console.log(user?.id, recipientId, "SSHHS");

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView
        flexDirection="row"
        alignItems="center"
        padding={20}
        borderBottomWidth={1}
        borderBottomColor="#eee"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 15 }}
        >
          <ArrowLeft2 size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <ThemedText fontSize={20} weight="bold">
          Test Call Screen
        </ThemedText>
      </ThemedView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Current User Info */}
        <View style={styles.infoCard}>
          <ThemedText fontSize={16} weight="bold" marginBottom={10}>
            Current User
          </ThemedText>
          <ThemedText fontSize={14} color="#666">
            ID: {user?.id || "Not available"}
          </ThemedText>
          <ThemedText fontSize={14} color="#666">
            Username: {user?.username || "Not available"}
          </ThemedText>
          <ThemedText fontSize={14} color="#666">
            Name: {user?.first_name} {user?.last_name}
          </ThemedText>
        </View>

        {/* Call Service Status */}
        <View style={styles.infoCard}>
          <ThemedText fontSize={16} weight="bold" marginBottom={10}>
            Call Service Status
          </ThemedText>
          <ThemedText fontSize={14} color={client ? "#4CAF50" : "#FF5722"}>
            Client: {client ? "Ready" : "Not Ready"}
          </ThemedText>
          <ThemedText fontSize={14} color="#666">
            Active Call: {activeCall ? activeCall.id : "None"}
          </ThemedText>
          <ThemedText fontSize={14} color="#666">
            Call State: {callState || "None"}
          </ThemedText>
        </View>

        {/* Permissions Status */}
        <View style={styles.infoCard}>
          <ThemedText fontSize={16} weight="bold" marginBottom={10}>
            Permissions Status
          </ThemedText>
          <ThemedText fontSize={14} color={permissionsRequested ? "#4CAF50" : "#FF9800"}>
            Status: {permissionsRequested ? "Requested" : "Requesting..."}
          </ThemedText>
          <ThemedText fontSize={14} color={micPermissionGranted ? "#4CAF50" : "#FF5722"}>
            Microphone: {micPermissionGranted ? "Granted" : "Not Granted"}
          </ThemedText>
          <ThemedText fontSize={14} color={cameraPermissionGranted ? "#4CAF50" : "#FF5722"}>
            Camera: {cameraPermissionGranted ? "Granted" : "Not Granted"}
          </ThemedText>
        </View>

        {/* Recipient Input */}
        <View style={styles.inputCard}>
          <ThemedText fontSize={16} weight="bold" marginBottom={10}>
            Recipient ID
          </ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter recipient user ID"
            placeholderTextColor="#999"
            value={recipientId}
            onChangeText={setRecipientId}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <ThemedText fontSize={12} color="#666" marginTop={5}>
            Enter the user ID of the person you want to call
          </ThemedText>
        </View>

        {/* Call Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.callButton, styles.audioButton]}
            onPress={handleAudioCall}
            disabled={!client || !recipientId.trim()}
          >
            <Call size={24} color="#fff" variant="Bold" />
            <ThemedText
              color="#fff"
              fontSize={16}
              weight="bold"
              marginLeft={10}
            >
              Test Audio Call
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.callButton, styles.videoButton]}
            onPress={handleVideoCall}
            disabled={!client || !recipientId.trim()}
          >
            <Video size={24} color="#fff" variant="Bold" />
            <ThemedText
              color="#fff"
              fontSize={16}
              weight="bold"
              marginLeft={10}
            >
              Test Video Call
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <ThemedText fontSize={14} weight="bold" marginBottom={8}>
            Testing Instructions:
          </ThemedText>
          <ThemedText fontSize={12} color="#666" marginBottom={5}>
            1. Enter the recipient's user ID above
          </ThemedText>
          <ThemedText fontSize={12} color="#666" marginBottom={5}>
            2. Make sure the recipient is logged in on another device
          </ThemedText>
          <ThemedText fontSize={12} color="#666" marginBottom={5}>
            3. Tap "Test Audio Call" or "Test Video Call"
          </ThemedText>
          <ThemedText fontSize={12} color="#666" marginBottom={5}>
            4. The recipient should see an incoming call screen
          </ThemedText>
          <ThemedText fontSize={12} color="#666">
            5. When they accept, you'll both be in the call
          </ThemedText>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <ThemedText fontSize={12} color="#FF9800" weight="bold">
            ⚠️ This is a test screen - Remove after testing
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  inputCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
  },
  buttonsContainer: {
    gap: 15,
    marginBottom: 20,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 12,
    opacity: 1,
  },
  audioButton: {
    backgroundColor: COLORS.primary,
  },
  videoButton: {
    backgroundColor: "#4CAF50",
  },
  instructionsCard: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  warningCard: {
    backgroundColor: "#fff3cd",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
});
