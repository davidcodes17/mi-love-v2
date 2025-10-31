import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, StatusBar, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCall } from "@/context/call-provider";
import { 
  useCall as useStreamCall,
  StreamVideo,
  StreamCall,
  CallContent,
  useConnectedUser
} from "@stream-io/video-react-native-sdk";
import { COLORS } from "@/config/theme";
import { ArrowLeft2, CallSlash } from "iconsax-react-native";
import { router } from "expo-router";
import ThemedView from "@/components/ui/themed-view";

export default function VideoCallScreen() {
  const { channel } = useLocalSearchParams<{ channel: string }>();
  const { joinCall, client } = useCall();
  const [isLoading, setIsLoading] = useState(true);
  const activeCall = useStreamCall();
  
  useEffect(() => {
    const setupCall = async () => {
      if (!channel || !client) return;
      
      try {
        setIsLoading(true);
        await joinCall(channel);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to join call:", err);
        router.back();
      }
    };
    
    setupCall();
    
    return () => {
      // Clean up when component unmounts
      if (activeCall) {
        activeCall.leave();
      }
    };
  }, [channel, client]);

  // If call isn't ready yet, show loading state
  if (isLoading || !activeCall || !client) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Connecting to call...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (activeCall) {
              activeCall.leave();
            }
            router.back();
          }}
        >
          <ArrowLeft2 color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{channel || "Video Call"}</Text>
      </View>

      <View style={styles.callContainer}>
        {/* The Stream SDK will render the call UI */}
        <StreamVideo client={client}>
          <StreamCall call={activeCall}>
            <CallUI />
          </StreamCall>
        </StreamVideo>
      </View>
    </SafeAreaView>
  );
}

// Simplified UI component for call
function CallUI() {
  const activeCall = useStreamCall();
  
  // End the call and go back
  const endCall = () => {
    if (activeCall) {
      activeCall.leave();
      router.back();
    }
  };
  
  // Toggle microphone
  const toggleMic = async () => {
    try {
      if (!activeCall) return;
      
      const isMuted = activeCall.microphone.enabled;
      if (isMuted) {
        await activeCall.microphone.enable();
      } else {
        await activeCall.microphone.disable();
      }
      console.log(`Microphone ${isMuted ? 'enabled' : 'muted'}`);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    }
  };
  
  // Toggle camera
  const toggleCamera = async () => {
    try {
      if (!activeCall) return;
      
      const isEnabled = activeCall.camera.enabled;
      if (isEnabled) {
        await activeCall.camera.disable();
      } else {
        await activeCall.camera.enable();
      }
      console.log(`Camera ${isEnabled ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Failed to toggle camera:', error);
    }
  };
  
  return (
    <View style={styles.callUIContainer}>
      {/* Main call content showing participants */}
      <CallContent />
      
      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMic}>
          <Text style={styles.controlText}>Mic</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleCamera}>
          <Text style={styles.controlText}>Camera</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
          <CallSlash size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  callContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  callUIContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Position controls at bottom
    padding: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  controlText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  endCallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
});