import FriendCompo from "@/components/common/friend-compo";
import SearchInput from "@/components/common/search-input";
import globalStyles from "@/components/styles/global-styles";
import ThemedView from "@/components/ui/themed-view";
import { useState, useRef } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView } from "react-native";

export default function Page() {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout: any = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = (text: string) => {
    setIsTyping(true);

    // Clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Set new timeout
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
    }, 500); // 500ms after last keystroke, stop loading
  };

  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ThemedView padding={20}>
        <SearchInput
          onChangeText={handleTyping}
          placeholder="Search something..."
        />

        {isTyping && (
          <ThemedView padding={20}>
            <ActivityIndicator />
          </ThemedView>
        )}

        <ThemedView paddingTop={5} >
          <ScrollView style={{
            paddingTop : 40
          }}>
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
            <FriendCompo isFriend />
          </ScrollView>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}
