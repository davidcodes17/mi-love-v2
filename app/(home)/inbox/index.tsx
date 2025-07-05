import ChatCompo from "@/components/common/chat-compo";
import globalStyles from "@/components/styles/global-styles";
import NativeText from "@/components/ui/native-text";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { COLORS } from "@/config/theme";
import { Message } from "iconsax-react-native";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const friendData = Array.from({ length: 12 }, (_, i) => ({ id: i.toString() }));
export default function Page() {
  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ThemedView padding={20}>
        <FlatList
          data={friendData}
          keyExtractor={(item) => item.id}
          renderItem={() => <ChatCompo />}
          ListHeaderComponent={() => (
            <ThemedView
              alignItems="center"
              flexDirection="row"
              marginBottom={20}
              gap={10}
              justifyContent="center"
            >
              <Message variant="Bold" size={20} color={COLORS.primary} />
              <ThemedText textAlign="center" fontSize={20}>
                Inbox
              </ThemedText>
            </ThemedView>
          )}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
