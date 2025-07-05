import globalStyles from "@/components/styles/global-styles";
import NativeButton from "@/components/ui/native-button";
import NativeText from "@/components/ui/native-text";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  return (
    <SafeAreaView style={{ flex: 1, position: "relative" }}>
      <Image source={{uri : "https://img.freepik.com/free-photo/young-beautiful-girl-posing-black-leather-jacket-park_1153-8104.jpg?semt=ais_hybrid&w=740"}} style={{
        height : 200,
        width : 200 
      }} />
      <NativeText>profile</NativeText>
      <NativeButton href={"/(entry)"} text={"Logout"} mode="fill" />
    </SafeAreaView>
  );
}
