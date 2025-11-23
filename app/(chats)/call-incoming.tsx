import { View, Text, TouchableOpacity } from "react-native";
import { useCallState } from "@/providers/CallStateProvider";
import { router } from "expo-router";

export default function CallIncoming() {
  const { call, setCall } = useCallState();

  if (!call) return null;

  const reject = () => {
    setCall(null);
    router.back();
  };

  const accept = () => {
    router.push({
        //@ts-ignore
      pathname: call.type === "video" ? "/video-call" : "/voice-call",
      params: { channel: call.callId }
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20 }}>
        Incoming {call.type} call from {call.caller.name}
      </Text>

      <View style={{ flexDirection: "row", marginTop: 40, gap: 20 }}>
        <TouchableOpacity
          onPress={reject}
          style={{ backgroundColor: "red", padding: 20, borderRadius: 50 }}
        >
          <Text style={{ color: "#fff" }}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={accept}
          style={{ backgroundColor: "green", padding: 20, borderRadius: 50 }}
        >
          <Text style={{ color: "#fff" }}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
