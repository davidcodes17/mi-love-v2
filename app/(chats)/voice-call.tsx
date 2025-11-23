import { useLocalSearchParams } from "expo-router";
import { StreamCall, CallContent } from "@stream-io/video-react-native-sdk";
import { useEffect } from "react";
import { streamClient } from "@/providers/StreamVideoProvider";

export default function VoiceCall() {
    const { channel } = useLocalSearchParams();
    const call = streamClient!.call("default", String(channel));

    useEffect(() => {
        call.join({
            data: {
                video: false,
            },
        });

        return () => {
            call.leave().catch(() => { });
        };
    }, []);

    return (
        <StreamCall call={call}>
            <CallContent />
        </StreamCall>
    );
}
