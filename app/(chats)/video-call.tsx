import { useLocalSearchParams } from "expo-router";
import { StreamCall, CallContent } from "@stream-io/video-react-native-sdk";
import { useEffect } from "react";
import { streamClient } from "@/providers/StreamVideoProvider";

export default function VideoCall() {
    const { channel } = useLocalSearchParams();

    const call = streamClient!.call("default", String(channel));

    useEffect(() => {
        call.join();

        return () => {
            // run and ignore the promise
            call.leave().catch(() => { });
        };
    }, []);


    return (
        <StreamCall call={call}>
            <CallContent />
        </StreamCall>
    );
}
