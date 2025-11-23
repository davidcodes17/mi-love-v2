import { View, Text, TouchableOpacity } from "react-native";
import { useCallState } from "@/providers/CallStateProvider";
import { router } from "expo-router";
import { streamClient } from "@/providers/StreamVideoProvider";

export default function CallOutgoing() {
    const { call, setCall } = useCallState();

    if (!call) return null;

    const streamCall = streamClient!.call("default", call.callId);

    const cancel = async () => {
        setCall(null);
        router.back();
    };

    const startCall = async () => {
        router.push({
            //@ts-ignore
            pathname: call.type === "video" ? "/video-call" : "/voice-call",
            params: { channel: call.callId }
        });
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 22 }}>Calling {call.callee.name}...</Text>

            <TouchableOpacity
                onPress={cancel}
                style={{ marginTop: 40, backgroundColor: "red", padding: 20, borderRadius: 50 }}
            >
                <Text style={{ color: "#fff" }}>Cancel</Text>
            </TouchableOpacity>

            {/* When remote user accepts */}
            <TouchableOpacity
                style={{ marginTop: 30 }}
                onPress={startCall}
            >
                <Text>Debug: Force join</Text>
            </TouchableOpacity>
        </View>
    );
}
