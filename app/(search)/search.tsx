import BackButton from "@/components/common/back-button";
import FriendCompo from "@/components/common/friend-compo";
import SearchInput from "@/components/common/search-input";
import globalStyles from "@/components/styles/global-styles";
import ThemedView, { ThemedText } from "@/components/ui/themed-view";
import { useGetAllFriends } from "@/hooks/friend-hooks.hooks";
import { useUserStore } from "@/store/store";
import { UserProfileR } from "@/types/auth.types";
import { FilterBy } from "@/types/friend.types";
import { useState, useRef } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView } from "react-native";

export default function Page() {
  const [searchText, setSearchText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [filterBy, setFilterBy] = useState<FilterBy>({ filterBy: "explore" });
  const [results, setResults] = useState<UserProfileR[]>([]);
  const typingTimeout: any = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = (text: string) => {
    setSearchText(text);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    if (!text.trim()) {
      setResults([]); // reset when input cleared
      return;
    }

    setIsTyping(true);

    typingTimeout.current = setTimeout(async () => {
      try {
        const response = await useGetAllFriends({
          filterBy,
          filterValue: searchText,
        });
        setResults(response?.data || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsTyping(false);
      }
    }, 600);
  };

  const { user: profile } = useUserStore();

  return (
    <SafeAreaView style={globalStyles.wrapper}>
      <ThemedView padding={20}>
        <ThemedView paddingBottom={20}>
          <BackButton />
        </ThemedView>
        <SearchInput
          onChangeText={handleTyping}
          placeholder="Search users..."
        />

        {isTyping && (
          <ThemedView padding={20}>
            <ActivityIndicator />
          </ThemedView>
        )}

        {!searchText && !isTyping && (
          <ThemedView padding={20}>
            <ThemedText>Start typing to search for users...</ThemedText>
          </ThemedView>
        )}

        <ScrollView style={{ paddingTop: 20 }}>
          {results.map((user) => (
            <FriendCompo key={user.id} user={user} isFriend={false} />
          ))}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
