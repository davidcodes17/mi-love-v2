import NativeText from "@/components/ui/native-text";
import { ThemedText } from "@/components/ui/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  return (
    <SafeAreaView style={{flex : 1, padding : 10}}>
      <ThemedText textAlign="center" fontSize={20} weight="medium">All Friends</ThemedText>
    </SafeAreaView>
  );
}
